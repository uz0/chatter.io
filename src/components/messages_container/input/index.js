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
import Icon from '@/components/icon';
import Loading from '@/components/loading';
import throttle from 'lodash/throttle';
import Suggestion from './suggestion';
import CRC32 from 'crc-32';
import inputActions from './actions';
import Message from './message';
import { scrollMessagesBottom, uid } from '@/helpers';
import { api } from '@';
import { actions as notificationActions } from '@/components/notification';
import { actions as messagesActions } from '@/store/messages';
import style from './style.css';

export { default as actions } from './actions';

const cx = classnames.bind(style);
const bytesSize = 64000;

class MessageInput extends Component {
  state = {
    attachments: [],
    value: this.props.draft || '',
    isSuggestionShown: false,
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

    if (event.keyCode === 13 && !event.shiftKey && document.activeElement === this.textareaRef) {
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

  onAttachFileChange = event => {
    let isSizeValid = true;

    [].forEach.call(event.target.files, file => {
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

    [].forEach.call(event.target.files, file => {
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

    [].forEach.call(event.target.files, (file, index) => {
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
      this.setState({ value, isSuggestionShown: false });
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
      this.setState({ value, isSuggestionShown: false });
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

    return this.state.isSuggestionShown;
  };

  closeSuggestion = () => this.setState({ isSuggestionShown: false });

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
    const pattern = /\B@[a-z0-9_-]+/gi;
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
      ...text ? {text} : {},
      ...attachments ? {attachments} : {},
      ...upload_id ? {upload_id} : {},
      ...this.props.edit_message_id ? {edit_message_id: this.props.edit_message_id} : {},
    });

    this.props.clearEditMessage();
    this.setState({ value: '', attachments: [] });
    setTimeout(() => this.calcTextareaHeight());
  };

  sendMessage = ({ text, attachments, mentions, upload_id }) => {
    this.props.sendMessage({
      ...text ? {text} : {},
      ...attachments ? {attachments} : {},
      ...mentions ? {mentions} : {},
      ...upload_id ? {upload_id} : {},
      ...this.props.reply_message_id ? {reply_message_id: this.props.reply_message_id} : {},
      subscription_id: this.props.subscription_id,
    });

    this.setState({ value: '', attachments: [] });
    setTimeout(() => this.calcTextareaHeight());

    if (this.props.reply_message_id) {
      this.props.clearReplyMessage();
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

    this.setState({
      value: event.target.value,
      ...isShown !== this.state.isSuggestionShown ? { isSuggestionShown: isShown } : {},
    });

    if (!this.props.edit_message_id && !this.props.reply_message_id) {
      setTimeout(() => this.throttleUpdateDraft(this.state.value));
    }
  };

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

  getProgressText = attachment => {
    if (!attachment || !attachment.currentChunk) {
      return null;
    }

    let type = '';
    let formattedChunkSize = null;
    let formattedFullSize = null;
    const fullSize = attachment.byte_size;

    if (fullSize < 1024) {
      type = this.props.t('b');
      formattedChunkSize = attachment.currentChunk;
      formattedFullSize = fullSize;
    }

    if (fullSize >= 1024 && fullSize < 1048576) {
      type = this.props.t('kb');
      formattedChunkSize = Math.ceil(attachment.currentChunk / 1024);
      formattedFullSize = Math.ceil(fullSize / 1024);
    }

    if (fullSize >= 1048576) {
      type = this.props.t('mb');
      formattedChunkSize = Math.ceil(attachment.currentChunk / 1048576);
      formattedFullSize = Math.ceil(fullSize / 1048576);
    }

    if (attachment.currentChunk < attachment.byte_size) {
      return `${formattedChunkSize} / ${formattedFullSize} ${type}`;
    }

    return `${formattedFullSize} ${type}`;
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.editing_message && !isEqual(this.props.editing_message, nextProps.editing_message)) {
      this.setState({
        ...nextProps.editing_message.text ? {value: nextProps.editing_message.text} : {},
        ...nextProps.editing_message.attachments ? {attachments: nextProps.editing_message.attachments} : {},
      });

      setTimeout(() => this.textareaRef.focus());
    }

    if (nextProps.reply_message_id && this.propsreply_message_id !== nextProps.reply_message_id) {
      setTimeout(() => this.textareaRef.focus());
    }

    if (this.props.subscription_id !== nextProps.subscription_id) {
      this.setState({
        value: nextProps.draft ? nextProps.draft : '',
        attachment: null,
        isSuggestionShown: false,
      });

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

    return <div className={cx('input', this.props.className)}>
      <Button
        appearance="_icon-transparent"
        icon="attach"
        onClick={this.attachFile}
        className={style.attach}
      />

      <input
        className={style.attach_input}
        type="file"
        ref={node => this.attachInputRef = node}
        onChange={this.onAttachFileChange}
        multiple
      />

      <div className={style.section}>
        {this.state.isSuggestionShown &&
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
              placeholder={this.props.t('message')}
              ref={node => this.textareaRef = node}
              value={this.state.value}
              onInput={this.onInput}
              onChange={() => {}}
              onKeyDown={this.onTextareaKeyDown}
            />

            {withImages &&
              <div className={style.gallery_preview}>
                {this.state.attachments.map((attachment, index) => {
                  const isAttachmentImage = attachment.content_type.match('image/');
                  const progress = this.getProgressText(attachment);

                  if (!isAttachmentImage) {
                    return;
                  }

                  return <div
                    key={index}
                    className={style.preview}
                    {...isAttachmentImage ? { style: {'--image': `url(${attachment.url})`} } : {}}
                  >
                    {!isAttachmentImage &&
                      <Icon name="attach" />
                    }

                    <button onClick={this.removeAttachment(index)}>
                      <Icon name="close" />
                    </button>

                    {attachment.isLoading &&
                      <p className={style.progress}>{progress}</p>
                    }

                    <Loading className={style.file_loading} isShown={attachment.isLoading} />
                  </div>;
                })}
              </div>
            }

            {withFiles &&
              <div className={style.uploaded_files}>
                {this.state.attachments.map((attachment, index) => {
                  const isAttachmentImage = attachment.content_type.match('image/');
                  const isLoading = attachment.currentChunk < attachment.byte_size;
                  const progress = this.getProgressText(attachment);

                  if (isAttachmentImage) {
                    return;
                  }

                  return <div className={style.file_item} key={index}>
                    {isLoading &&
                      <Loading className={style.file_loading} isShown />
                    }

                    {!isLoading &&
                      <Icon name="file" />
                    }

                    <p className={style.title}>{attachment.file_name}</p>
                    <span className={style.size}>{progress}</span>

                    <button className={style.delete} onClick={this.removeAttachment(index)}>
                      <Icon name="close" />
                    </button>
                  </div>;
                })}
              </div>
            }
          </div>

          <button onClick={this.onSendButtonClick} className={cx({'_is-shown': isSendButtonShown})}>
            {sendButtonName}
          </button>
        </div>
      </div>
    </div>;
  }
}

export default compose(
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
    }),

    {
      updateDraft: inputActions.updateDraft,
      sendMessage: inputActions.sendMessage,
      updateMessage: inputActions.updateMessage,
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
