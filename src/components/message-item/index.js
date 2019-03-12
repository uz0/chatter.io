import React, { Component } from 'react';
import compose from 'recompose/compose';
import moment from 'moment';
import get from 'lodash/get';
import find from 'lodash/find';
import reject from 'lodash/reject';
import isEqual from 'lodash/isEqual';
import { connect } from 'react-redux';
import SubscriptionAvatar from '@/components/subscription-avatar';
import { withNamespaces } from 'react-i18next';
import classnames from 'classnames/bind';
import Icon from '@/components/icon';
import Dropdown from '@/components/dropdown';
import Button from '@/components/button';
import RefMessage from './ref-message';
import { api } from '@';
import { actions as messagesActions } from '@/store/messages';
import { actions as dropdownActions } from '@/components/dropdown';
import { actions as notificationActions } from '@/components/notification';
import { actions as modalActions } from '@/components/modal_container';
import { actions as inputActions } from '@/components/messages_container/input';
import Lightbox from 'react-lightbox-component';
import 'react-lightbox-component/build/css/index.css';
import style from './style.css';

const cx = classnames.bind(style);

class MessageItem extends Component {
  getFileType = () => this.props.message.attachment.content_type.split('/').pop();
  getFileSizeKb = () => parseInt(this.props.message.attachment.byte_size / 1000, 10);

  renderMessageText = message => {
    let text = message.text;

    if (!text) {
      return;
    }

    if (message.mentions) {
      message.mentions.forEach(mention => {
        let link = '';

        if (mention.user_id === this.props.currentUser.id) {
          link = `<a>@${mention.text}</a>`;
        } else {
          link = `<a href="/chat/user/${mention.user_id}">@${mention.text}</a>`;
        }

        text = text.split(`@${mention.text}`).join(link);
      });
    }

    // eslint-disable-next-line no-useless-escape
    const linkreg = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;

    if (text.match(linkreg)) {
      text = text.replace(linkreg, '<a href="$1" target="_blank">$1</a>');
    }

    return text;
  };

  openUpdateMessage = () => this.props.addEditMessage(this.props.message.id);
  openReplyMessage = () => this.props.addReplyMessage(this.props.message.forwarded_message_id || this.props.message.id);

  openForwardModal = () => {
    this.props.addForwardMessage(this.props.message.forwarded_message_id || this.props.message.id);
    this.props.toggleModal({ id: 'forward-modal' });
  }

  resendMessage = () => this.props.resendMessage({
    uid: this.props.message.uid,
    subscription_id: this.props.details.id,
  });

  onDelete = () => api.deleteMessage({ message_id: this.props.message.id })
    .catch(error => this.props.showNotification(this.props.t(error.code)));

  isParticipantsReadedChanged = nextProps => {
    if (!this.props.details || !nextProps.details) {
      return false;
    }

    const participants = reject(this.props.details.group.participants, { user_id: this.props.currentUser.id });
    const nextPropsParticipants = reject(nextProps.details.group.participants, { user_id: this.props.currentUser.id });

    if (!participants || !nextPropsParticipants) {
      return false;
    }

    if (participants.length !== nextPropsParticipants.length) {
      return false;
    }

    let isReadedChanged = false;

    participants.forEach(participant => {
      const nextPropsParticipant = find(nextPropsParticipants, { user_id: participant.user_id });

      if (!nextPropsParticipant) {
        return false;
      }

      if (participant.last_read_message_id !== nextPropsParticipant.last_read_message_id) {
        isReadedChanged = true;
      }
    });

    return isReadedChanged;
  };

  isReaded = () => {
    if (!this.props.message.id) {
      return false;
    }

    const participants = reject(this.props.details.group.participants, { user_id: this.props.currentUser.id });

    if (!participants) {
      return false;
    }

    let maxReadedMessageId = 0;

    participants.forEach(participant => {
      if (participant.last_read_message_id > maxReadedMessageId) {
        maxReadedMessageId = participant.last_read_message_id;
      }
    });

    if (maxReadedMessageId >= this.props.message.id) {
      return true;
    }

    return false;
  };

  shouldComponentUpdate(nextProps) {
    const isCurrentUserChanged = !isEqual(this.props.currentUser, nextProps.currentUser);
    const isMessageChanged = !isEqual(this.props.message, nextProps.message);
    const isDropdownToggled = this.props.isDropdownShown !== nextProps.isDropdownShown;
    const isRefMessageDeletedChanged = this.props.isRefMessageDeleted !== nextProps.isRefMessageDeleted;
    const isParticipantsReadedChanged = this.isParticipantsReadedChanged(nextProps);

    return isCurrentUserChanged ||
      isMessageChanged ||
      isDropdownToggled ||
      isParticipantsReadedChanged ||
      isRefMessageDeletedChanged;
  }

  renderMessageBlock = () => {
    const isMessageHasImage = this.props.message.attachment && this.props.message.attachment.content_type.match('image/');
    const isMessageHasFile = this.props.message.attachment && !isMessageHasImage;

    return <div className={style.message_block}>
      {(this.props.message.in_reply_to_message_id || this.props.message.forwarded_message_id) &&
        <RefMessage
          className={style.message}
          {...this.props.message.forwarded_message_id ? { forwardedId: this.props.message.forwarded_message_id } : {}}
          {...this.props.message.in_reply_to_message_id ? { repliedId: this.props.message.in_reply_to_message_id } : {}}
        />
      }

      {this.props.message.text &&
        <p className={style.text} dangerouslySetInnerHTML={{__html: this.renderMessageText(this.props.message)}} />
      }

      {isMessageHasFile &&
        <div className={style.file}>
          <Icon name="add-chat" />

          <div className={style.section}>
            <p className={style.name}>File</p>

            <div className={style.subcaption}>
              <p className={style.text}>Filename.{this.getFileType()}</p>

              <span className={style.size}>
                {this.getFileSizeKb()} {this.props.t('kb')}
              </span>
            </div>
          </div>
        </div>
      }
    </div>;
  };

  render() {
    const isMessageDeleted = !!this.props.message.deleted_at;
    const isMessageHasImage = this.props.message.attachment && this.props.message.attachment.content_type.match('image/');
    const isMessageHasFile = this.props.message.attachment && !isMessageHasImage;
    const isMessageCurrentUser = this.props.currentUser && this.props.message.user_id === this.props.currentUser.id;
    const isMarkShown = this.props.message.user_id === this.props.currentUser.id && !this.props.message.isError;
    const isAvatarShown = (this.props.type === 'last' || this.props.type === 'single') && !this.props.message.isError;

    const isMessageTextBlockShown = isMessageHasFile ||
      (this.props.message.text && this.props.message.text.replace(/\s/g,'').length > 0) ||
      this.props.message.forwarded_message_id ||
      this.props.message.in_reply_to_message_id;

    const isMessageInCurrentHour = moment().diff(moment(this.props.message.created_at), 'hours') === 0;
    const isActionsShown = !isMessageDeleted && !this.props.isMobile && !this.props.isRefMessageDeleted;
    const isReaded = this.isReaded();
    const isCurrentUserAdmin = this.props.details.role === 'admin';

    let actionsItems = [{ icon: 'forward', text: this.props.t('forward'), onClick: this.openForwardModal }];

    if (this.props.isMobile) {
      actionsItems.unshift({ icon: 'reply', text: this.props.t('reply'), onClick: this.openReplyMessage });
    }

    if (isMessageCurrentUser && isMessageInCurrentHour && !this.props.message.forwarded_message_id) {
      actionsItems.unshift({ icon: 'edit', text: this.props.t('edit'), onClick: this.openUpdateMessage });
    }

    if ((isMessageCurrentUser && isMessageInCurrentHour) || isCurrentUserAdmin) {
      actionsItems.push({ icon: 'delete', text: this.props.t('delete'), onClick: this.onDelete, isDanger: true });
    }

    return <div className={cx(
      'message-item',
      this.props.className,

      {
        'current-user': isMessageCurrentUser,
        'opponent-user': !isMessageCurrentUser,
        '_is-dropdown-shown': this.props.isDropdownShown,
        '_is-first': this.props.type === 'first',
        '_is-middle': this.props.type === 'middle',
        '_is-last': this.props.type === 'last',
      },
    )}>
      {isActionsShown &&
        <div className={style.actions}>
          <Dropdown
            uniqueId={`message-dropdown-${this.props.message.uid || this.props.message.id}`}
            className={style.dropdown}
            items={actionsItems}
          >
            <Button appearance="_icon-transparent" icon="dots" className={style.dropdown_button} />
          </Dropdown>

          <Button
            appearance="_basic-transparent"
            text="Reply"
            icon="reply"
            className={style.button}
            onClick={this.openReplyMessage}
          />
        </div>
      }

      {isMessageDeleted &&
        <div className={style.content}>
          <p className={style.deleted_message_text}>{this.props.t('message_has_been_deleted')}</p>
        </div>
      }

      {!isMessageDeleted &&
        <div className={style.content}>
          {isMessageTextBlockShown && !this.props.isMobile &&
            this.renderMessageBlock()
          }

          {isMessageTextBlockShown && this.props.isMobile &&
            <Dropdown
              uniqueId={`message-dropdown-${this.props.message.uid || this.props.message.id}`}
              className={style.dropdown}
              items={actionsItems}
            >
              {this.renderMessageBlock()}
            </Dropdown>
          }

          {isMessageHasImage &&
            <Lightbox
              images={[{src: this.props.message.attachment.preview}]}

              renderImageFunc={(idx, image, toggleLightbox) => <img
                key={idx}
                src={image.src}
                onClick={() => toggleLightbox(idx)}
              />}
            />
          }
        </div>
      }

      <div className={style.info}>
        {!isMessageDeleted &&
          <span className={style.time}>{moment(this.props.message.created_at).format('HH:mm')}</span>
        }

        {isAvatarShown &&
          <SubscriptionAvatar
            userId={this.props.message.user_id}
            className={style.avatar}
          />
        }

        {this.props.message.isError &&
          <Dropdown
            uniqueId={`message-error-dropdown-${this.props.message.uid || this.props.message.id}`}
            className={style.error_dropdown}

            items={[
              { text: this.props.t('resend'), onClick: this.resendMessage },
            ]}
          >
            <Button appearance="_icon-transparent" icon="warning" className={style.error_dropdown_button} />
          </Dropdown>
        }

        {isMarkShown &&
          <div className={style.mark}>
            <Icon name="mark" />

            {isReaded &&
              <Icon name="mark" />
            }
          </div>
        }
      </div>
    </div>;
  }
}

export default compose(
  withNamespaces('translation'),

  connect(
    (state, props) => ({
      currentUser: state.currentUser,
      message: state.messages.list[props.id],
      isMobile: state.device === 'touch',
    }),

    {
      addEditMessage: messagesActions.addEditMessage,
      addReplyMessage: messagesActions.addReplyMessage,
      addForwardMessage: messagesActions.addForwardMessage,
      openDropdown: dropdownActions.openDropdown,
      resendMessage: inputActions.resendMessage,
      toggleModal: modalActions.toggleModal,
      showNotification: notificationActions.showNotification,
    },
  ),

  connect(
    (state, props) => ({
      isDropdownShown: get(state, `dropdown.message-dropdown-${props.message.uid || props.message.id}.isShown`, false),
      details: find(state.subscriptions.list, { group_id: props.message.group_id }),
    }),
  ),
  
  connect(
    (state, props) => {
      const refMessageId = props.message.forwarded_message_id || props.message.in_reply_to_message_id;

      if (!refMessageId) {
        return {};
      }

      const refMessage = state.messages.list[refMessageId];

      if (!refMessage) {
        return {};
      }

      const isRefMessageDeleted = !!refMessage.deleted_at;

      return {
        isRefMessageDeleted,
      };
    },
  ),
)(MessageItem);
