import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import compose from 'recompose/compose';
import classnames from 'classnames/bind';
import { withNamespaces } from 'react-i18next';
import style from './style.css';

const cx = classnames.bind(style);

class Message extends Component {
  getMessageText = () => {
    if (this.props.message.deleted_at) {
      return this.props.t('deleted_message');
    }

    if (this.props.message.forwarded_message_id) {
      return this.props.t('forwarded_message');
    }

    if (this.props.message.in_reply_to_message_id) {
      return this.props.t('replied_message');
    }

    if (this.props.message.xtag) {
      const author = this.props.users_list[this.props.message.user_id];
      const ref = this.props.users_list[this.props.message.reference.id];

      const authorNick = author && author.nick || 'no nick';
      const refNick = ref && ref.nick || 'no nick';

      const isInvite = this.props.message.xtag === 'invite';
      const isCreation = this.props.message.xtag === 'creation';
      const isLeave = this.props.message.xtag === 'leave';
      const isKick = this.props.message.xtag === 'kick_out';
      const isJoined = this.props.message.xtag === 'joined';

      let text = '';

      if (isKick) {
        text = this.props.t('xtag_message_kick', { user_nick: authorNick, reference_user_nick: refNick });
      }

      if (isLeave) {
        text = this.props.t('xtag_message_leave', { user_nick: authorNick });
      }

      if (isCreation) {
        text = this.props.t('xtag_message_creation', { user_nick: authorNick });
      }

      if (isInvite) {
        text = this.props.t('xtag_message_invite', { user_nick: authorNick, reference_user_nick: refNick });
      }

      if (isJoined) {
        text = this.props.t('xtag_message_joined', { user_nick: authorNick });
      }

      return text;
    }

    const isMessageHasAttachment = this.props.message.attachment;
    const isMessageAttachmentImage = isMessageHasAttachment && this.props.message.attachment.content_type.match('image/');

    if (!isMessageHasAttachment) {
      return this.props.message.text.replace(/<(?:.|\n)*?>/gm, '');
    }

    if (isMessageAttachmentImage) {
      return this.props.t('image');
    }

    return this.props.t('file');
  };

  getLastMessageTime = () => {
    if (moment(this.props.message.created_at).startOf('day').diff(moment().startOf('day'), 'days') === 0) {
      return moment(this.props.message.created_at).format('h:mm a');
    }

    if (moment(this.props.message.created_at).startOf('day').diff(moment().startOf('day'), 'days') === -1) {
      return this.props.t('yesterday');
    }

    return moment(this.props.message.created_at).format('DD MMM');
  };

  render() {
    const author = this.props.users_list[this.props.message.user_id] || {};
    const authorNick = author.id !== this.props.currentUser.id ? author.nick || 'no nick' : this.props.t('you');

    return <div className={cx('message', this.props.className)}>
      {!this.props.message.xtag &&
        <p className={style.text}>
          {!this.props.message.deleted_at && `${authorNick}: `}
          {this.getMessageText()}
        </p>
      }

      {this.props.message.xtag &&
        <p
          className={style.text}
          dangerouslySetInnerHTML={{__html: this.getMessageText()}}
        />
      }

      {!this.props.message.deleted_at &&
        <span className={style.time}>{this.getLastMessageTime()}</span>
      }
    </div>;
  }
}

export default compose(
  withNamespaces('translation'),

  connect(
    state => ({
      currentUser: state.currentUser,
      // если не добавлять users - не обновляется компонент добавлении новых пользователей
      users: state.users,
      users_list: state.users.list,
    }),
  ),
)(Message);
