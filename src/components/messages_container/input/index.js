import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import find from 'lodash/find';
import findIndex from 'lodash/findIndex';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import classnames from 'classnames/bind';
import Button from '@/components/button';
import throttle from 'lodash/throttle';
import Suggestion from './suggestion';
import Gallery from './gallery';
import Files from './files';
import CRC32 from 'crc-32';
import inputActions from './actions';
import Message from './message';
import { scrollMessagesBottom, uid } from '@/helpers';
import { withRouter } from '@/hoc';
import { api } from '@';
import { actions as notificationActions } from '@/components/notification';
import { actions as messagesActions } from '@/store/messages';
import { actions as dropdownActions } from '@/components/dropdown';
import style from './style.css';

export { default as actions } from './actions';

const cx = classnames.bind(style);
const bytesSize = 64000;

class MessageInput extends Component {
  state = {
    attachments: [],
    isMessageInputFocused: false,
    value: this.props.draft || '',
  };

  onTextareaKeyDown = event => {
    if (event.keyCode === 13) {
      event.preventDefault();
    }
  };

  setNewLineTextarea = () => {
    const selection = this.textareaRef.selectionStart;
    const newValue = this.state.value.substring(0, selection) + '\n' + this.state.value.substring(selection, this.state.value.length);
    this.setState({ value: newValue });
    this.calcTextareaHeight();
    setTimeout(() => this.textareaRef.setSelectionRange(selection + 1, selection + 1));
  };

  mobileDocumentKeyDown = event => {
    if (event.keyCode === 13 && document.activeElement === this.textareaRef) {
      this.setNewLineTextarea();
    }
  };

  desktopDocumentKeyDown = event => {
    if (event.keyCode === 13 && event.shiftKey && document.activeElement === this.textareaRef) {
      this.setNewLineTextarea();
    }

    if (event.keyCode === 13 && !this.props.isSuggestionShown && !event.shiftKey && document.activeElement === this.textareaRef) {
      this.onSendButtonClick();
    }
  };

  handleDocumentKeyDown = event => {
    if (this.props.isMobile) {
      this.mobileDocumentKeyDown(event);
    } else {
      this.desktopDocumentKeyDown(event);
    }
  };

  attachFile = () => this.attachInputRef.click();

  resetAttachment = () => {
    this.attachInputRef.value = '';
    this.setState({ attachments: [] });
  };

  getBlobBase = blob => new Promise(resolve => {
    const reader = new FileReader();

    reader.onloadend = event => {
      let binaryString = '';
      const bytes = new Uint8Array(event.target.result);

      for (let i = 0; i < bytes.byteLength; i++) {
        binaryString += String.fromCharCode(bytes[i]);
      }

      resolve(window.btoa(binaryString));
    };

    reader.readAsArrayBuffer(blob);
  });

  getFileChecksum = file => new Promise(resolve => {
    const reader = new FileReader();

    reader.onloadend = event => {
      const bytes = new Uint8Array(event.target.result);
      resolve(CRC32.buf(bytes) >>> 0);
    };

    reader.readAsArrayBuffer(file);
  });

  onAttachFileChange = event => this.attachFiles(event.target.files);

  attachFiles = files => {
    let isSizeValid = true;

    [].forEach.call(files, file => {
      if (file.size > 209715200) {
        isSizeValid = false;
      }
    });

    if (!isSizeValid) {
      this.props.showNotification({
        type: 'info',

        text: this.props.t(
          'validation_max_size',

          {
            object: this.props.t('file'),
            count: 200,
            size_type: this.props.t('mb').toLowerCase(),
          },
        ),
      });

      return;
    }

    let attachments = [];

    [].forEach.call(files, file => {
      attachments.push({
        uid: uid(),
        byte_size: file.size,
        content_type: file.type,
        file_name: file.name,
        preview: '',
        url: '',
        upload_id: null,
        isLoading: true,
      });
    });

    this.setState({ attachments });

    [].forEach.call(files, (file, index) => {
      const attachment = attachments[index];
      setTimeout(() => this.loadFileByChunks(file, attachment.uid));
      const reader = new FileReader();

      reader.onloadend = () => {
        attachments[index].preview = reader.result;
        attachments[index].url = reader.result;
        this.setState({ attachments });
      };

      reader.readAsDataURL(file);
    });

    this.attachInputRef.value = '';
  };

  onPaste = event => {
    event.persist();
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;
    let files = [];

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') === 0) {
        files.push(items[i].getAsFile());
      }
    }

    if (files.length === 0) {
      return;
    }

    this.attachFiles(files);
  };

  updateAttachmentState = (uid, data) => {
    let attachments = this.state.attachments;
    const index = findIndex(attachments, { uid });

    if (index === -1) {
      return;
    }

    attachments[index] = {
      ...attachments[index],
      ...data,
    };

    this.setState({ attachments });
  };

  loadFileByChunks = async (file, uid) => {
    try {
      if (file.size <= bytesSize) {
        await this.loadFullFile(file, uid);
        return;
      }

      await this.loadMainPartFile(file, uid);
    } catch (error) {
      console.error(error);

      this.props.showNotification({
        type: 'error',
        text: error.text,
      });

      this.resetAttachment();
    }
  };

  loadFullFile = async (file, uid) => {
    const chunk = await this.getBlobBase(file);
    const checksum = await this.getFileChecksum(file);

    const response = await api.attachmentByChunks({
      file_chunk: chunk,
      upload_id: null,
      file_size: file.size,
      file_checksum: checksum,
      file_name: file.name,
    });

    this.updateAttachmentState(uid, {
      currentChunk: file.size,
      isLoading: false,
      upload_id: response.upload_id,
    });
  };

  loadMainPartFile = async (file, uid) => {
    let attachment = find(this.state.attachments, { uid });
    let blob = file.slice(0, bytesSize);
    let chunk = await this.getBlobBase(blob);
    const checksum = await this.getFileChecksum(file);

    const response = await api.attachmentByChunks({
      file_chunk: chunk,
      upload_id: null,
      file_size: file.size,
      file_checksum: checksum,
      file_name: file.name,
    });

    attachment.currentChunk = bytesSize;
    attachment.upload_id = response.upload_id;

    if (file.size <= bytesSize) {
      attachment.isLoading = false;
    }

    this.updateAttachmentState(uid, attachment);

    if (file.size - bytesSize < bytesSize) {
      this.loadLastChunk(file, uid);
      return;
    }

    for (let i = bytesSize; i <= file.size; i += bytesSize) {
      const currentStateAttachment = find(this.state.attachments, { uid });

      if (!currentStateAttachment) {
        break;
      }

      attachment.currentChunk = i;
      this.updateAttachmentState(uid, attachment);

      blob = file.slice(i, i + bytesSize);
      chunk = await this.getBlobBase(blob);

      await api.attachmentByChunks({
        file_chunk: chunk,
        upload_id: response.upload_id,
        file_size: file.size,
        file_checksum: checksum,
        file_name: file.name,
      });
    }

    const rest = file.size - attachment.currentChunk + bytesSize;

    if (rest > 0 && rest < bytesSize) {
      this.loadLastChunk(file, uid);
      return;
    }

    attachment.currentChunk = file.size;
    attachment.isLoading = false;
    this.updateAttachmentState(uid, attachment);
  };

  loadLastChunk = async (file, uid) => {
    const currentStateAttachment = find(this.state.attachments, { uid });

    if (!currentStateAttachment) {
      return;
    }

    const blob = file.slice(currentStateAttachment.currentChunk, file.size);
    const chunk = await this.getBlobBase(blob);
    const checksum = await this.getFileChecksum(file);

    await api.attachmentByChunks({
      file_chunk: chunk,
      upload_id: currentStateAttachment.upload_id,
      file_size: file.size,
      file_checksum: checksum,
      file_name: file.name,
    });

    this.updateAttachmentState(uid, {
      currentChunk: file.size,
      isLoading: false,
    });
  };

  removeAttachment = index => () => {
    let attachments = this.state.attachments;
    attachments.splice(index, 1);
    this.setState({ attachments });
  };

  getFilteredMessage = value => {
    if (!value) {
      return '';
    }

    let text = value.replace(/\r|\n|\r\n/g, '<br />');

    if (text[0] === ' ') {
      text = text.substring(1);
    }

    if (text[text.length - 1] === ' ') {
      text = text.substring(0, text.length - 1);
    }

    return text;
  };

  setMention = nick => {
    const currentCursorPosition = this.textareaRef.selectionStart;
    const lastChar = this.state.value[currentCursorPosition - 1];
    const start = this.state.value.substr(0, currentCursorPosition);

    if (lastChar === '@') {
      let end = this.state.value.substr(currentCursorPosition);

      if (end.length > 0 && end[0] !== ' ') {
        end = ` ${end}`;
      }

      const value = `${start}${nick}${end}`;
      this.setState({ value });
      this.closeSuggestion();
      this.textareaRef.focus();
      return;
    }

    const lastMentionIndex = start.lastIndexOf('@');

    if (lastMentionIndex !== -1) {
      const start = this.state.value.substr(0, lastMentionIndex);
      let end = this.state.value.substr(lastMentionIndex);
      const firstDelimiterInEnd = end.indexOf(' ');

      if (firstDelimiterInEnd !== -1) {
        end = end.substr(firstDelimiterInEnd);
      } else {
        end = '';
      }

      const value = `${start}@${nick}${end}`;
      this.setState({ value });
      this.closeSuggestion();
      this.textareaRef.focus();
      return;
    }
  };

  checkIsSuggestionShown = value => {
    if (!this.props.isGroup) {
      return false;
    }

    if (!value) {
      return false;
    }

    const currentCursorPosition = this.textareaRef.selectionStart;
    const lastChar = value[currentCursorPosition - 1];
    const prevChar = value[currentCursorPosition - 2];

    if (lastChar === '@') {
      if (value.length === 1) {
        return true;
      }

      if (prevChar === ' ') {
        return true;
      }
    }

    if (lastChar === ' ') {
      return false;
    }

    return this.props.isSuggestionShown;
  };

  openSuggestion = () => this.props.openDropdown({ uniqueId: 'suggestion-dropdown' });
  closeSuggestion = () => this.props.closeDropdown('suggestion-dropdown');

  getCurrentMentionSearch = () => {
    if (!this.textareaRef) {
      return;
    }

    const currentCursorPosition = this.textareaRef.selectionStart;

    if (this.state.value[currentCursorPosition - 1] === '@' && this.state.value[currentCursorPosition] === ' ') {
      return;
    }

    const start = this.state.value.substr(0, currentCursorPosition);
    const lastMentionIndex = start.lastIndexOf('@');

    if (lastMentionIndex === -1) {
      return;
    }

    const end = this.state.value.substr(lastMentionIndex + 1);
    const firstDelimiterInEnd = end.indexOf(' ');
    const nick = end.substr(0, firstDelimiterInEnd === -1 ? end.length : firstDelimiterInEnd);
    return nick;
  };

  parseMentions = text => {
    if (!text) {
      return null;
    }

    let mentions = [];
    const pattern = /\B([@][\w._-]+)/gi;
    const allMentions = text.match(pattern);

    this.props.users_ids.forEach(id => {
      const user = this.props.users_list[id];

      if (!user.nick) {
        return;
      }

      const isUserExistInMentions = find(allMentions, mention => `${mention.toLowerCase()}` === `@${user.nick.toLowerCase()}`);

      if (isUserExistInMentions) {
        mentions.push({ user_id: user.id, text: user.nick });
      }
    });

    return mentions || null;
  };

  editMessage = ({ text, attachments, upload_id }) => {
    this.props.updateMessage({
      ...text ? { text } : {},
      ...attachments ? { attachments } : {},
      ...upload_id ? { upload_id } : {},
      ...this.props.edit_message_id ? { edit_message_id: this.props.edit_message_id } : {},
    });

    this.props.clearEditMessage();
    this.setState({ value: '', attachments: [] });
    setTimeout(() => this.calcTextareaHeight());
  };

  sendMessage = ({ text, attachments, mentions, upload_id }) => {
    this.props.sendMessage({
      ...text ? { text } : {},
      ...attachments ? { attachments } : {},
      ...mentions ? { mentions } : {},
      ...upload_id ? { upload_id } : {},
      ...this.props.reply_message_id ? { reply_message_id: this.props.reply_message_id } : {},
      subscription_id: this.props.subscription_id,
    });

    this.setState({ value: '', attachments: [] });
    setTimeout(() => this.calcTextareaHeight());

    if (this.props.reply_message_id) {
      this.props.clearReplyMessage();
    }

    if (this.props.match.params.tagname) {
      this.resetFilters();
    }
  };

  resetFilters = () => {
    const indexOfTag = location.pathname.indexOf('/tag');

    if (indexOfTag !== -1) {
      this.props.replaceUrl(location.pathname.substr(0, indexOfTag));

      setTimeout(() => {
        const messageList = document.getElementById('messages-scroll');
        messageList.scrollTo(0, messageList.scrollHeight);
      });
    }
  };

  onSendButtonClick = () => {
    if (!this.isSendButtonShown()) {
      return;
    }

    let upload_id = [];
    let attachments = [];

    if (this.state.attachments) {
      this.state.attachments.forEach(attachment => {
        upload_id.push(attachment.upload_id);

        attachments.push({
          byte_size: attachment.byte_size,
          content_type: attachment.content_type,
          url: attachment.url,
        });
      });
    }

    this.textareaRef.focus();
    const text = this.getFilteredMessage(this.state.value);
    const mentions = this.parseMentions(text);

    if (!text && !attachments) {
      this.props.showNotification({
        type: 'info',
        text: 'No data to send',
      });
      return;
    }

    if (this.props.edit_message_id) {
      this.editMessage({ text, attachments, upload_id });
      return;
    }

    this.sendMessage({
      text,
      mentions,
      upload_id,
      attachments,
    });
  };

  calcTextareaHeight = () => {
    if (!this.textareaRef) {
      return;
    }

    scrollMessagesBottom(() => {
      this.textareaRef.style.height = '20px';
      this.textareaRef.style.height = `${this.textareaRef.scrollHeight}px`;
    });
  };

  isSendButtonShown = () => {
    if (find(this.state.attachments, { isLoading: true })) {
      return false;
    }

    if (!this.props.edit_message_id && this.state.attachments.length > 0 && find(this.state.attachments, attachment => !attachment.upload_id)) {
      return false;
    }

    if (this.state.value && `${this.state.value}`.replace(/^\s+/, '').replace(/\s+$/, '').length > 0) {
      return true;
    }

    if (this.state.attachments.length > 0) {
      return true;
    }

    return false;
  };

  updateDraft = value => this.props.updateDraft({ id: this.props.subscription_id, value });
  throttleUpdateDraft = throttle(this.updateDraft, 500);

  onInput = event => {
    this.calcTextareaHeight();
    const isShown = this.checkIsSuggestionShown(event.target.value);

    if (isShown !== this.props.isSuggestionShown) {
      if (isShown) {
        this.openSuggestion();
      } else {
        this.closeSuggestion();
      }
    }

    this.setState({ value: event.target.value });

    if (!this.props.edit_message_id && !this.props.reply_message_id) {
      setTimeout(() => this.throttleUpdateDraft(this.state.value));
    }
  };

  onFocus = () => {
    if (!this.props.isMobile) {
      return;
    }

    this.setState({ isMessageInputFocused: true });
  }

  onBlur = () => {
    if (!this.props.isMobile) {
      return;
    }

    this.setState({ isMessageInputFocused: false });
  }

  closeMessage = () => {
    if (this.props.edit_message_id) {
      this.props.clearEditMessage();
    }

    if (this.props.reply_message_id) {
      this.props.clearReplyMessage();
    }

    this.setState({
      value: this.props.draft ? this.props.draft : '',
      attachment: null,
    });
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.editing_message && !isEqual(this.props.editing_message, nextProps.editing_message)) {
      this.setState({
        ...nextProps.editing_message.text ? { value: nextProps.editing_message.text } : {},
        ...nextProps.editing_message.attachments ? { attachments: nextProps.editing_message.attachments } : {},
      });

      setTimeout(() => this.textareaRef.focus());
    }

    if (nextProps.reply_message_id && this.props.reply_message_id !== nextProps.reply_message_id) {
      setTimeout(() => this.textareaRef.focus());
    }

    if (this.props.subscription_id !== nextProps.subscription_id) {
      this.setState({
        value: nextProps.draft ? nextProps.draft : '',
        attachment: null,
      });

      if (this.props.isSuggestionShown) {
        this.closeSuggestion();
      }

      if (this.props.reply_message_id) {
        this.props.clearReplyMessage();
      }

      if (this.props.edit_message_id) {
        this.props.clearEditMessage();
      }

      setTimeout(() => this.textareaRef.focus());
    }
  }

  componentDidMount() {
    this.calcTextareaHeight();
    this.textareaRef.focus();
    window.addEventListener('keydown', this.handleDocumentKeyDown);
  }

  componwntWillUnmount() {
    document.removeEventListener('keydown', this.handleDocumentKeyDown);
  }

  render() {
    const isSendButtonShown = this.isSendButtonShown();
    const messageId = this.props.reply_message_id || this.props.edit_message_id;
    const sendButtonName = this.props.edit_message_id ? this.props.t('edit') : this.props.t('send');
    const currentMentionSearch = this.getCurrentMentionSearch();
    const withFiles = !!find(this.state.attachments, attachment => attachment.content_type.indexOf('image/') === -1);
    const withImages = !!find(this.state.attachments, attachment => attachment.content_type.indexOf('image/') !== -1);
    const isAttachButtonHidden = this.props.isMobile && this.state.isMessageInputFocused && this.state.value.length > 0;

    return <div className={cx('input', this.props.className)}>
      <Button
        icon="attach"
        appearance="_icon-transparent"
        onClick={this.attachFile}
        className={cx(style.attach, { '_is-hidden': isAttachButtonHidden })}
      />

      <input
        className={style.attach_input}
        type="file"
        ref={node => this.attachInputRef = node}
        onChange={this.onAttachFileChange}
        multiple
      />

      <div className={style.section}>
        {this.props.isSuggestionShown &&
          <Suggestion
            subscription_id={this.props.subscription_id}
            onSelect={this.setMention}
            className={style.suggestion}
            search={currentMentionSearch}
            onClose={this.closeSuggestion}
          />
        }

        {messageId &&
          <Message className={style.message} id={messageId} onClose={this.closeMessage} />
        }

        <div className={style.input_wrapper} ref={node => this.inputWrapperRef = node}>
          <div className={style.input_content}>
            <textarea
              id="textarea"
              placeholder={this.props.t('message')}
              ref={node => this.textareaRef = node}
              value={this.state.value}
              onInput={this.onInput}
              onChange={() => { }}
              onFocus={this.onFocus}
              onBlur={this.onBlur}
              onKeyDown={this.onTextareaKeyDown}
              onPaste={this.onPaste}
            />

            {withImages &&
              <Gallery
                attachments={this.state.attachments}
                removeAttachment={this.removeAttachment}
                className={style.gallery_preview}
              />
            }

            {withFiles &&
              <Files
                attachments={this.state.attachments}
                removeAttachment={this.removeAttachment}
                className={style.uploaded_files}
              />
            }
          </div>

          <button onClick={this.onSendButtonClick} className={cx({ '_is-shown': isSendButtonShown })}>
            {sendButtonName}
          </button>
        </div>
      </div>
    </div>;
  }
}

export default compose(
  withRouter,
  withTranslation(),

  connect(
    (state, props) => ({
      draft: get(state.subscriptions.list[props.subscription_id], 'draft', ''),
      isGroup: get(state.subscriptions.list[props.subscription_id], 'group.type', '') === 'room',
      edit_message_id: state.messages.edit_message_id,
      reply_message_id: state.messages.reply_message_id,
      users_ids: state.users.ids,
      users_list: state.users.list,
      isMobile: state.device === 'touch',
      isSuggestionShown: get(state.dropdown, 'suggestion-dropdown.isShown', false),
    }),

    {
      updateDraft: inputActions.updateDraft,
      sendMessage: inputActions.sendMessage,
      updateMessage: inputActions.updateMessage,
      openDropdown: dropdownActions.openDropdown,
      closeDropdown: dropdownActions.closeDropdown,
      clearEditMessage: messagesActions.clearEditMessage,
      clearReplyMessage: messagesActions.clearReplyMessage,
      showNotification: notificationActions.showNotification,
    },
  ),

  connect(
    (state, props) => ({
      editing_message: props.edit_message_id ? state.messages.list[props.edit_message_id] : null,
    }),
  ),
)(MessageInput);
