import React, { Component } from 'react';
import compose from 'recompose/compose';
import moment from 'moment';
import get from 'lodash/get';
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

  onDelete = () => api.deleteMessage({ message_id: this.props.message.id })
    .catch(error => this.props.showNotification(this.props.t(error.code)));

  isDeviceMobile = () => {
    const deviceWidth = document.body.offsetWidth;

    if (deviceWidth > 1024) {
      return false;
    }

    return true;
  };

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
    const isMessageTextBlockShown = isMessageHasFile || this.props.message.text || this.props.message.forwarded_message_id || this.props.message.in_reply_to_message_id;
    const isMessageInCurrentHour = moment().diff(moment(this.props.message.created_at), 'hours') === 0;
    const isActionsShown = !isMessageDeleted && !this.props.isMobile && !this.props.isRefMessageDeleted;

    let actionsItems = [{ icon: 'forward', text: this.props.t('forward'), onClick: this.openForwardModal }];

    if (this.props.isMobile) {
      actionsItems.unshift({ icon: 'reply', text: this.props.t('reply'), onClick: this.openReplyMessage });
    }

    if (isMessageCurrentUser && isMessageInCurrentHour && !this.props.message.forwarded_message_id) {
      actionsItems.unshift({ icon: 'edit', text: this.props.t('edit'), onClick: this.openUpdateMessage });
    }

    if (isMessageCurrentUser && isMessageInCurrentHour) {
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
            <div className={style.image}>
              <img src={this.props.message.attachment.preview} />
            </div>
          }
        </div>
      }

      <div className={style.info}>
        {!isMessageDeleted &&
          <span className={style.time}>{moment(this.props.message.created_at).format('HH:mm')}</span>
        }

        {(this.props.type === 'last' || this.props.type === 'single') &&
          <SubscriptionAvatar
            userId={this.props.message.user_id}
            className={style.avatar}
          />
        }

        {this.props.message.user_id === this.props.currentUser.id &&
          <div className={style.mark}>
            <Icon name="mark" />

            {this.props.isReaded &&
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
      toggleModal: modalActions.toggleModal,
      showNotification: notificationActions.showNotification,
    },
  ),

  connect(
    (state, props) => ({
      isDropdownShown: get(state, `dropdown.message-dropdown-${props.message.uid || props.message.id}.isShown`, false),
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
