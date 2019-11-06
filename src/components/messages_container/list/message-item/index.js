import React, { Component } from 'react';
import compose from 'recompose/compose';
import moment from 'moment';
import get from 'lodash/get';
import map from 'lodash/map';
import filter from 'lodash/filter';
import find from 'lodash/find';
import reject from 'lodash/reject';
import isEqual from 'lodash/isEqual';
import { connect } from 'react-redux';
import SubscriptionAvatar from '@/components/subscription-avatar';
import { withTranslation } from 'react-i18next';
import classnames from 'classnames/bind';
import Icon from '@/components/icon';
import Link from '@/components/link';
import Dropdown from '@/components/dropdown';
import Button from '@/components/button';
import MessageBlock from './message-block';
import { scrollMessagesBottom } from '@/helpers';
import { api } from '@';
import { actions as messagesActions } from '@/store/messages';
import { actions as notificationActions } from '@/components/notification';
import modalActions from '@/components/modal_container/actions';
import { actions as galleryActions } from '@/components/gallery_container';
import { actions as inputActions } from '@/components/messages_container/input';
import style from './style.css';

const cx = classnames.bind(style);

class MessageItem extends Component {
  updateMessage = () => this.props.addEditMessage(this.props.message.id);
  replyMessage = () => this.props.addReplyMessage(this.props.message.forwarded_message_id || this.props.message.id);

  openUpdateMessage = () => scrollMessagesBottom(this.updateMessage, 1);
  openReplyMessage = () => scrollMessagesBottom(this.replyMessage, 1);

  openForwardModal = () => {
    let modalObj = { id: 'forward-modal' };

    if (this.props.details.group.organization_id) {
      modalObj['options'] = {
        organization_id: this.props.details.group.organization_id,
      };
    }

    this.props.addForwardMessage(this.props.message.forwarded_message_id || this.props.message.id);
    this.props.toggleModal(modalObj);
  }

  resendMessage = () => this.props.resendMessage({
    uid: this.props.message.uid,
    subscription_id: this.props.details.id,
  });

  onDelete = () => api.deleteMessage({ message_id: this.props.message.id })
    .catch(error => this.props.showNotification({
      type: 'error',
      text: this.props.t(error.code),
    }));

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

  toggleCheckMessage = () => {
    if (!this.props.message.id) {
      return;
    }

    this.props.toggleCheckMessage(this.props.message.id);
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
    const isCheckedChanged = this.props.isChecked !== nextProps.isChecked;
    const isCheckShownChanged = this.props.isCheckShown !== nextProps.isCheckShown;

    return isCurrentUserChanged ||
      isMessageChanged ||
      isDropdownToggled ||
      isParticipantsReadedChanged ||
      isCheckedChanged ||
      isCheckShownChanged ||
      isRefMessageDeletedChanged;
  }

  render() {
    const errorDropdownActions = [{text: this.props.t('resend'), onClick: this.resendMessage}];
    const time = moment(this.props.message.created_at).format('HH:mm');
    const images = this.props.message.attachments && filter(this.props.message.attachments, attachment => attachment.content_type.match('image/')) || [];
    const files = this.props.message.attachments && filter(this.props.message.attachments, attachment => !attachment.content_type.match('image/')) || [];

    const isMessageDeleted = !!this.props.message.deleted_at;
    const isMessageHasText = (this.props.message.text || '').replace(/\s/g,'').length > 0;
    const isMessageCurrentUser = this.props.currentUser && this.props.message.user_id === this.props.currentUser.id;
    const isMarkShown = this.props.message.user_id === this.props.currentUser.id && !this.props.message.isError;

    const isAvatarShown = (this.props.type === 'last' || this.props.type === 'single') &&
      !this.props.message.isError &&
      this.props.message.user_id !== this.props.currentUser.id;

    const isMessageTextBlockShown = files.length > 0 || isMessageHasText ||
      this.props.message.forwarded_message_id ||
      this.props.message.in_reply_to_message_id;

    const isMessageBlockShown = (isMessageTextBlockShown && !this.props.isMobile && this.props.details.group.type === 'global_channel') ||
      (isMessageTextBlockShown && !this.props.isMobile && this.props.details.group.type !== 'global_channel') ||
      (isMessageTextBlockShown && this.props.isMobile && this.props.details.group.type === 'global_channel');

    const isMessageBlockShownWithDropdown = isMessageTextBlockShown && this.props.isMobile && this.props.details.group.type !== 'global_channel';

    const isGalleryShownWithDropdown = images.length > 0 && !isMessageTextBlockShown && this.props.isMobile && this.props.details.group.type !== 'global_channel';
    const isGalleryShownWithoutDropdown = images.length > 0 && !isGalleryShownWithDropdown;

    const isMessageInCurrentHour = moment().diff(moment(this.props.message.created_at), 'hours') === 0;
    const isActionsShown = !isMessageDeleted && !this.props.isMobile && !this.props.isRefMessageDeleted && this.props.details.group.type !== 'global_channel';
    const isReaded = this.isReaded();
    const isCurrentUserAdmin = this.props.details.role === 'admin';
    const imagesUrls = map(images, image => image.url);
    const isCheckShown = !isMessageDeleted && this.props.isCheckShown;

    let actionsItems = [{ icon: 'forward', text: this.props.t('forward'), onClick: this.openForwardModal }];

    if (this.props.isMobile) {
      actionsItems.unshift({ icon: 'reply', text: this.props.t('reply'), onClick: this.openReplyMessage });
    }

    if (isMessageCurrentUser && isMessageInCurrentHour && !this.props.message.forwarded_message_id) {
      actionsItems.unshift({ icon: 'edit', text: this.props.t('edit'), onClick: this.openUpdateMessage });
    }

    if (!this.props.isCheckShown) {
      actionsItems.push({ icon: 'dots', text: this.props.t('more'), onClick: this.toggleCheckMessage });
    }

    if ((isMessageCurrentUser && isMessageInCurrentHour) || isCurrentUserAdmin) {
      actionsItems.push({ icon: 'delete', text: this.props.t('delete'), onClick: this.onDelete, isDanger: true });
    }

    if (isGalleryShownWithDropdown) {
      actionsItems.unshift({
        icon: 'full-screen',
        text: this.props.t('open_gallery'),

        onClick: () => this.props.openGallery({
          images: imagesUrls,
          index: 0,
        }),
      });
    }

    return <div
      data-message-id={this.props.message.id || this.props.message.uid}

      className={cx(
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
      )}
    >
      {isCheckShown &&
        <button
          type="button"
          className={cx('check', {'_is-active': this.props.isChecked})}
          onClick={this.toggleCheckMessage}
        >
          <Icon name="mark" />
        </button>
      }

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
          {isMessageBlockShown &&
            <MessageBlock
              uid={this.props.uid}
              chatId={this.props.details.id}
              type={this.props.type}
              className={style.message_block}
            />
          }

          {isMessageBlockShownWithDropdown &&
            <Dropdown
              uniqueId={`message-dropdown-${this.props.message.uid || this.props.message.id}`}
              className={style.dropdown}
              items={actionsItems}
            >
              <MessageBlock
                uid={this.props.uid}
                chatId={this.props.details.id}
                type={this.props.type}
                className={style.message_block}
              />
            </Dropdown>
          }

          {isGalleryShownWithoutDropdown &&
            <div className={style.gallery}>
              {images.map((image, index) => <div
                key={image.url}
                className={style.image}

                onClick={() => this.props.openGallery({
                  images: imagesUrls,
                  index,
                })}
              >
                <img src={image.url} />
              </div>)}
            </div>
          }

          {isGalleryShownWithDropdown &&
            <Dropdown
              uniqueId={`message-dropdown-${this.props.message.uid || this.props.message.id}`}
              className={style.gallery_dropdown}
              items={actionsItems}
            >
              <div className={style.gallery}>
                {images.map(image => <div
                  key={image.url}
                  className={style.image}
                >
                  <img src={image.url} />
                </div>)}
              </div>
            </Dropdown>
          }

          {false &&
            <div className={style.todo}>
              <button className={style.item}>
                <div className={style.circle}>
                  <Icon name="mark" />
                </div>

                <p className={style.title}>Fix header on iPhone X</p>
              </button>
            </div>
          }
        </div>
      }

      <div className={style.info}>
        {!isMessageDeleted &&
          <span className={style.time}>{time}</span>
        }

        {isAvatarShown &&
          <Link to={`/chat/user/${this.props.message.user_id}`} className={style.avatar_wrap}>
            <SubscriptionAvatar
              userId={this.props.message.user_id}
              className={style.avatar}
            />
          </Link>
        }

        {this.props.message.isError &&
          <Dropdown
            uniqueId={`message-error-dropdown-${this.props.message.uid || this.props.message.id}`}
            className={style.error_dropdown}
            items={errorDropdownActions}
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
  withTranslation(),

  connect(
    (state, props) => ({
      currentUser: state.currentUser,
      message: find(state.messages.list, { uid: props.uid }),
      isMobile: state.device === 'touch',
      isCheckShown: state.messages.checked_ids.length > 0,
    }),

    {
      addEditMessage: messagesActions.addEditMessage,
      addReplyMessage: messagesActions.addReplyMessage,
      addForwardMessage: messagesActions.addForwardMessage,
      toggleCheckMessage: messagesActions.toggleCheckMessage,
      resendMessage: inputActions.resendMessage,
      toggleModal: modalActions.toggleModal,
      openGallery: galleryActions.openGallery,
      showNotification: notificationActions.showNotification,
    },
  ),

  connect(
    (state, props) => ({
      isDropdownShown: get(state, `dropdown.message-dropdown-${props.message.uid || props.message.id}.isShown`, false),
      details: find(state.subscriptions.list, { group_id: props.message.group_id }),
      isChecked: props.isCheckShown ? state.messages.checked_ids.indexOf(props.message.id) !== -1 : false,
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
