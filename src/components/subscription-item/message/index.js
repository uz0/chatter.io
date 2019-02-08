import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import compose from 'recompose/compose';
import classnames from 'classnames/bind';
import { withNamespaces } from 'react-i18next';
import style from './style.css';

const cx = classnames.bind(style);

class Message extends Component {
  getMessageText = () => {
    const isMessageHasAttachment = this.props.message.attachment;
    const isMessageAttachmentImage = isMessageHasAttachment && this.props.message.attachment.content_type.match('image/');

    if (!isMessageHasAttachment) {
      return this.props.message.text;
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
    const isMessageSimple = !this.props.message.deleted_at &&
      !this.props.message.forwarded_message_id &&
      !this.props.message.in_reply_to_message_id &&
      !this.props.message.xtag;

    const author = this.props.users_list[this.props.message.user_id] || {};
    const authorNick = author.id !== this.props.currentUser.id ? author.nick || 'no nick' : this.props.t('you');

    return <div className={cx('message', this.props.className)}>
      {this.props.message.deleted_at &&
        <p className={style.text}>{this.props.t('deleted_message')}</p>
      }

      {this.props.message.forwarded_message_id &&
        <p className={style.text}>{this.props.t('forwarded_message')}</p>
      }

      {this.props.message.in_reply_to_message_id &&
        <p className={style.text}>{this.props.t('replied_message')}</p>
      }

      {this.props.message.xtag &&
        <p className={style.text}>{this.props.message.text}</p>
      }

      {isMessageSimple &&
        <Fragment>
          <p className={style.text}>{authorNick}: {this.getMessageText()}</p>
          <span className={style.time}>{this.getLastMessageTime()}</span>
        </Fragment>
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
