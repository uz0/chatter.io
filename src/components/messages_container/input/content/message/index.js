import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import classnames from 'classnames/bind';
import SubscriptionAvatar from '@/components/subscription-avatar';
import Icon from '@/components/icon';
import { actions as messagesActions } from '@/store/messages';
import style from './style.css';

const cx = classnames.bind(style);

class Message extends Component {
  close = () => {
    if (this.props.edit_message_id) {
      this.props.clearEditMessage();
      return;
    }

    if (this.props.reply_message_id) {
      this.props.clearReplyMessage();
      return;
    }
  };

  render() {
    if (!this.props.message || !this.props.user) {
      return null;
    }

    const nick = this.props.user.nick || 'no nick';
    const isMessageHasText = (this.props.message.text || '').replace(/\s/g,'').length > 0;
    const isMessageHasAttachment = !!this.props.message.attachment;
    const isAttachmentImage = isMessageHasAttachment && this.props.message.attachment.content_type.match('image/');
    const attachment = isAttachmentImage ? '<image>' : '<file>';

    return <div className={cx('message', this.props.className)}>
      <SubscriptionAvatar className={style.avatar} userId={this.props.user.id} />
      <p className={style.name}>{nick}</p>

      <p className={style.text}>
        {isMessageHasAttachment &&
          <span>{attachment}</span>
        }

        {isMessageHasText &&
          this.props.message.text
        }
      </p>

      <button className={style.delete} onClick={this.close}>
        <Icon name="close" />
      </button>
    </div>;
  }
}

export default compose(
  connect(
    state => ({
      reply_message_id: state.messages.reply_message_id,
      edit_message_id: state.messages.edit_message_id,
    }),

    {
      clearEditMessage: messagesActions.clearEditMessage,
      clearReplyMessage: messagesActions.clearReplyMessage,
    },
  ),

  connect(
    (state, props) => {
      let message = null;
      let user = null;
      const messageId = props.reply_message_id || props.edit_message_id;

      if (messageId) {
        message = state.messages.list[messageId];
        user = state.users.list[message.user_id];
      }

      return {
        message,
        user,
      };
    },
  ),
)(Message);
