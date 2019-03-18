import React, { Component } from 'react';
import { Link } from 'react-router';
import compose from 'recompose/compose';
import map from 'lodash/map';
import isEmpty from 'lodash/isEmpty';
import filter from 'lodash/filter';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { getOpponentUser } from '@/helpers';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

class Photos extends Component {
  render() {
    let messages = this.props.messages;

    messages = filter(messages, message => message.attachment && message.attachment.content_type.match('image/'));
    messages = filter(messages, message => !message.deleted_at);

    const isImagesExist = messages.length > 0;
    let emptyMessage = this.props.t('empty_message', {entity: this.props.t('photo_plural')}).toLowerCase();
    emptyMessage = emptyMessage.charAt(0).toUpperCase() + emptyMessage.slice(1);
    let href = '';

    if (this.props.details.group.type === 'private_chat' && !isEmpty(getOpponentUser(this.props.details))) {
      href = `/chat/user/${getOpponentUser(this.props.details).id}`;
    } else {
      href = `/chat/${this.props.details.id}`;
    }

    return <div className={cx(style.list, this.props.className)}>
      {isImagesExist &&
        messages.map(message => <Link
          key={message.id || message.uid}
          to={`${href}/${message.id || message.uid}`}
          className={style.photo}
          style={{ '--image': `url(${message.attachment.preview})` }}
        />)
      }

      {!isImagesExist &&
        <p className={style.empty}>{emptyMessage}</p>
      }
    </div>;
  }
}

export default compose(
  withNamespaces('translation'),

  connect(
    (state, props) => ({
      messages: map(state.messages.chatIds[props.details.id].list, id => state.messages.list[id]),
    }),
  ),
)(Photos);
