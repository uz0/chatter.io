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
import Validators from '@/components/form/validators';
import throttle from 'lodash/throttle';
import inputActions from './actions';
import Message from './message';
import { actions as notificationActions } from '@/components/notification';
import { actions as messagesActions } from '@/store/messages';
import style from './style.css';

export { default as actions } from './actions';

const cx = classnames.bind(style);

class MessageInput extends Component {
  state = {
    attachment: null,
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
    this.setState({ attachment: null });
  };

  onAttachFileChange = event => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    if (Validators.fileMaxSize(200000)(file)) {
      this.props.showNotification(this.props.t('validation_max_size', {
        object: this.props.t('file'),
        size_type: this.props.t('kb'),
        count: 200,
      }));

      this.resetAttachment();
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
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

  editMessage = ({ text, attachment }) => {
    this.props.updateMessage({
      ...text ? {text} : {},
      ...attachment ? {attachment} : {},
      ...this.props.edit_message_id ? {edit_message_id: this.props.edit_message_id} : {},
    });

    this.props.clearEditMessage();
    this.setState({ value: '', attachment: null });
    setTimeout(() => this.calcTextareaHeight());
  };

  sendMessage = ({ text, attachment, mentions }) => {
    this.props.sendMessage({
      ...text ? {text} : {},
      ...attachment ? {attachment} : {},
      ...mentions ? {mentions} : {},
      ...this.props.reply_message_id ? {reply_message_id: this.props.reply_message_id} : {},
      subscription_id: this.props.subscription_id,
    });

    this.setState({ value: '', attachment: null });

    setTimeout(() => {
      this.calcTextareaHeight();

      if (this.props.onMessageSend) {
        this.props.onMessageSend();
      }
    });

    if (this.props.reply_message_id) {
      this.props.clearReplyMessage();
    }
  };

  onSendButtonClick = () => {
    const text = this.getFilteredMessage(this.state.value);
    const attachment = this.state.attachment;
    const mentions = this.parseMentions(text);

    if (!text && !attachment) {
      this.props.showNotification('No data to send');
      return;
    }

    if (this.props.edit_message_id) {
      this.editMessage({ text, attachment });
      return;
    }

    this.sendMessage({ text, attachment, mentions });
  };

  calcTextareaHeight = () => {
    this.textareaRef.style.height = '20px';

    if (this.textareaRef.scrollHeight > 20) {
      this.textareaRef.style.height = this.textareaRef.scrollHeight + 10 + 'px';
      this.inputWrapperRef.style.marginTop =  '10px';
    } else {
      this.inputWrapperRef.style.marginTop =  0;
    }
  };

  isSendButtonShown = () => {
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
