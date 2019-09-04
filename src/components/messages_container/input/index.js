import React, { Component, Fragment } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import moment from 'moment';
import find from 'lodash/find';
import get from 'lodash/get';
import map from 'lodash/map';
import filter from 'lodash/filter';
import sortBy from 'lodash/sortBy';
import isEqual from 'lodash/isEqual';
import classnames from 'classnames/bind';
import Button from '@/components/button';
import Attach from '@/components/attach';
import throttle from 'lodash/throttle';
import Suggestion from './suggestion';
import Gallery from './gallery';
import Files from './files';
import inputActions from './actions';
import Message from './message';
import { scrollMessagesBottom } from '@/helpers';
import { withRouter } from '@/hoc';
import { actions as notificationActions } from '@/components/notification';
import { actions as messagesActions } from '@/store/messages';
import { actions as dropdownActions } from '@/components/dropdown';
import style from './style.css';

export { default as actions } from './actions';

const cx = classnames.bind(style);

class MessageInput extends Component {
  state = {
    attachments: [],
    upload_id: [],
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

  attach = () => {
    const input = document.getElementById('message-input-attach');
    input.click();
  };

  onAttachmentsChange = data => {
    const upload_id = map(data, item => item.upload_id);

    this.setState({ upload_id });
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

    this.setState({ value: '', attachments: [], upload_id: [] });
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
      upload_id: this.state.upload_id,
      attachments,
    });

    this.setState({
      upload_id: [],
      attachments: [],
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

    if (this.state.upload_id.length > 0) {
      return true;
    }

    return false;
  };

  updateDraft = value => {
    const textarea = document.querySelector('#textarea');

    if (!textarea) {
      return;
    }

    // момент, когда сообщение уже отправлено,
    // через пол секунды иногда проскакивает старый драфт
    if (!textarea.value && value) {
      return;
    }

    this.props.updateDraft({ id: this.props.subscription_id, value });
  };

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

  getGroupedMessages = () => {
    let messages = map(this.props.messages, id => this.props.messages_list[id]);
    messages = filter(messages, message => !message.xtag);
    messages = filter(messages, message => !message.deleted_at);
    messages = filter(messages, message => !message.in_reply_to_message_id);
    messages = filter(messages, message => !message.forwarded_message_id);
    messages = sortBy(messages, message => moment(message.created_at)).reverse();

    return messages;
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

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleDocumentKeyDown);
  }

  render() {
    const isSendButtonShown = this.isSendButtonShown();
    const messageId = this.props.reply_message_id || this.props.edit_message_id;
    const sendButtonName = this.props.edit_message_id ? this.props.t('edit') : this.props.t('send');
    const currentMentionSearch = this.getCurrentMentionSearch();
    const groupedMessages = this.getGroupedMessages();
    const lastMessage = groupedMessages[0];
    const isAttachButtonHidden = this.props.isMobile && this.state.isMessageInputFocused && this.state.value.length > 0;

    return <div className={cx('input', this.props.className)}>
      <Button
        icon="attach"
        onClick={this.attach}
        appearance="_icon-transparent"
        className={cx(style.attach, { '_is-hidden': isAttachButtonHidden })}
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

            <Attach
              key={lastMessage ? lastMessage.id : 0}
              uniqueId="message-input-attach"
              onChange={this.onAttachmentsChange}
            >
              {({ files, images, removeAttachment }) => {
                const isImagesExist = images.length > 0;
                const isFilesExist = files.length > 0;

                return <Fragment>
                  {isImagesExist && <Gallery
                    attachments={images}
                    removeAttachment={removeAttachment}
                    className={style.gallery_preview}
                  />
                  }

                  {isFilesExist && <Files
                    attachments={files}
                    removeAttachment={removeAttachment}
                    className={style.uploaded_files}
                  />
                  }
                </Fragment>;
              }}
            </Attach>

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
      messages: get(state.messages, `chatIds.${props.subscription_id}.list`, []),
      messages_list: state.messages.list,
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
