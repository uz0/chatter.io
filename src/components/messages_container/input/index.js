import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import find from 'lodash/find';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import classnames from 'classnames/bind';
import Button from '@/components/button';
import Icon from '@/components/icon';
import Loading from '@/components/loading';
import Validators from '@/components/form/validators';
import throttle from 'lodash/throttle';
import CRC32 from 'crc-32';
import inputActions from './actions';
import Message from './message';
import { api } from '@';
import { actions as notificationActions } from '@/components/notification';
import { actions as messagesActions } from '@/store/messages';
import style from './style.css';

export { default as actions } from './actions';

const cx = classnames.bind(style);
const bytesSize = 64000;

class MessageInput extends Component {
  state = {
    attachment: null,
    upload_id: null,
    value: this.props.draft || '',
    isFileLoading: false,
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
    this.setState({ attachment: null, upload_id: null, isFileLoading: false });
  };

  createLinkToJsonArguments = object => {
    const a = document.createElement('a');
    const data = 'text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(object));
    a.setAttribute('href', `data:${data}`);
    a.setAttribute('download', 'data.json');
    document.body.appendChild(a);
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

  loadFileByChunks = async file => {
    try {
      this.setState({ isFileLoading: true });
      const firstResponse = await this.loadFirstChunk(file);
      await this.loadLastChunks(file, firstResponse);
      this.setState({ upload_id: firstResponse.upload_id, isFileLoading: false });
    } catch (error) {
      console.error(error);
      this.props.showNotification(error.text);
      this.resetAttachment();
    }
  };

  loadFirstChunk = async file => {
    let blob = file.slice(0, bytesSize);
    let chunk = await this.getBlobBase(blob);
    const checksum = await this.getFileChecksum(file);

    return api.attachmentByChunks({
      file_chunk: chunk,
      upload_id: null,
      file_size: file.size,
      file_checksum: checksum,
      file_name: file.name,
    });
  };

  loadLastChunks = async (file, firstResponse) => {
    const checksum = await this.getFileChecksum(file);

    for (let i = bytesSize; i <= file.size; i += bytesSize) {
      let blob = file.slice(i, i + bytesSize);
      let chunk = await this.getBlobBase(blob);

      await api.attachmentByChunks({
        file_chunk: chunk,
        upload_id: firstResponse.upload_id,
        file_size: file.size,
        file_checksum: checksum,
        file_name: file.name,
      });
    }
  };

  onAttachFileChange = event => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    if (file.size === 0) {
      this.props.showNotification(this.props.t('you_cannot_upload_empty_files'));
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      if (Validators.fileMaxSize(200000)(file)) {
        this.loadFileByChunks(file);
      }

      this.setState({
        attachment: {
          byte_size: file.size,
          content_type: file.type,
          preview: reader.result,
          url: reader.result,
        },
      });
    };

    reader.readAsDataURL(file);
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

  parseMentions = text => {
    if (!text) {
      return null;
    }

    let mentions = [];

    this.props.users_ids.forEach(id => {
      const user = this.props.users_list[id];

      if (user.nick && text.match(`@${user.nick}`) && !find(mentions, {user_id: user.id})) {
        mentions.push({ user_id: user.id, text: user.nick });
      }
    });

    return mentions || null;
  };

  editMessage = ({ text, attachment, upload_id }) => {
    this.props.updateMessage({
      ...text ? {text} : {},
      ...attachment ? {attachment} : {},
      ...upload_id ? {upload_id} : {},
      ...this.props.edit_message_id ? {edit_message_id: this.props.edit_message_id} : {},
    });

    this.props.clearEditMessage();
    this.setState({ value: '', attachment: null, upload_id: null });
    setTimeout(() => this.calcTextareaHeight());
  };

  sendMessage = ({ text, attachment, mentions, upload_id }) => {
    this.props.sendMessage({
      ...text ? {text} : {},
      ...attachment ? {attachment} : {},
      ...mentions ? {mentions} : {},
      ...upload_id ? {upload_id} : {},
      ...this.props.reply_message_id ? {reply_message_id: this.props.reply_message_id} : {},
      subscription_id: this.props.subscription_id,
    });

    this.setState({ value: '', attachment: null, upload_id: null });
    setTimeout(() => this.calcTextareaHeight());

    if (this.props.reply_message_id) {
      this.props.clearReplyMessage();
    }
  };

  onSendButtonClick = () => {
    if (this.state.isFileLoading) {
      return;
    }

    this.textareaRef.focus();
    const text = this.getFilteredMessage(this.state.value);
    const attachment = this.state.attachment;
    const upload_id = this.state.upload_id;
    const mentions = this.parseMentions(text);

    if (!text && !attachment) {
      this.props.showNotification('No data to send');
      return;
    }

    if (this.props.edit_message_id) {
      this.editMessage({ text, attachment, upload_id });
      return;
    }

    this.sendMessage({
      text,
      mentions,
      upload_id,
      attachment,
    });
  };

  calcTextareaHeight = () => {
    if (!this.textareaRef) {
      return;
    }

    this.textareaRef.style.height = '20px';

    if (this.textareaRef.scrollHeight > 20) {
      this.textareaRef.style.height = this.textareaRef.scrollHeight + 10 + 'px';
      this.inputWrapperRef.style.marginTop =  '10px';
    } else {
      this.inputWrapperRef.style.marginTop =  0;
    }
  };

  isSendButtonShown = () => {
    if (this.state.isFileLoading) {
      return false;
    }

    if (this.state.value) {
      return true;
    }

    if (this.state.attachment) {
      return true;
    }

    return false;
  };

  updateDraft = value => this.props.updateDraft({ id: this.props.subscription_id, value });
  throttleUpdateDraft = throttle(this.updateDraft, 500);

  onInput = event => {
    this.calcTextareaHeight();
    this.setState({ value: event.target.value });

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
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.editing_message && !isEqual(this.props.editing_message, nextProps.editing_message)) {
      this.setState({
        ...nextProps.editing_message.text ? {value: nextProps.editing_message.text} : {},
        ...nextProps.editing_message.attachment ? {attachment: nextProps.editing_message.attachment} : {},
      });

      setTimeout(() => this.textareaRef.focus());
    }

    if (this.props.subscription_id !== nextProps.subscription_id) {
      this.setState({
        value: nextProps.draft ? nextProps.draft : '',
        attachment: null,
      });

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
    const isAttachmentImage = this.state.attachment && this.state.attachment.content_type.match('image/');
    const messageId = this.props.reply_message_id || this.props.edit_message_id;
    const sendButtonName = this.props.edit_message_id ? this.props.t('edit') : this.props.t('send');

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
      />

      <div className={style.section}>
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

            {this.state.attachment &&
              <div
                className={style.preview}
                {...isAttachmentImage ? { style: {'--image': `url(${this.state.attachment.preview})`} } : {}}
              >
                {!isAttachmentImage &&
                  <Icon name="attach" />
                }

                <button onClick={this.resetAttachment}>
                  <Icon name="close" />
                </button>

                <Loading className={style.file_loading} isShown={this.state.isFileLoading} />
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
  withNamespaces('translation'),

  connect(
    (state, props) => ({
      draft: get(state.subscriptions.list[props.subscription_id], 'draft', ''),
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
