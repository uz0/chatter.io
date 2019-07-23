import React, { Component } from 'react';
import Link from '@/components/link';
import compose from 'recompose/compose';
import map from 'lodash/map';
import get from 'lodash/get';
import find from 'lodash/find';
import filter from 'lodash/filter';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { getChatUrl, uid } from '@/helpers';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

class Photos extends Component {
  render() {
    let messages = this.props.messages;

    messages = filter(messages, message => message.attachments && find(message.attachments, attachment => attachment.content_type.match('image/')));
    messages = filter(messages, message => !message.deleted_at);

    const isImagesExist = messages.length > 0;
    let emptyMessage = this.props.t('empty_message', {entity: this.props.t('photo_plural')}).toLowerCase();
    emptyMessage = emptyMessage.charAt(0).toUpperCase() + emptyMessage.slice(1);
    const href = getChatUrl();

    return <div className={cx(style.list, this.props.className)}>
      {isImagesExist &&
        messages.map(message => message.attachments.map(attachment => {
          if (!attachment.content_type.match('image/')) {
            return;
          }

          return <Link
            key={uid()}
            to={`${href}/${message.id || message.uid}`}
            className={style.photo}
            style={{ '--image': `url(${attachment.url})` }}
          />;
        }))
      }

      {!isImagesExist &&
        <p className={style.empty}>{emptyMessage}</p>
      }
    </div>;
  }
}

export default compose(
  withTranslation(),

  connect(
    (state, props) => ({
      messages: map(get(state.messages.chatIds[props.details.id], 'list', []), id => state.messages.list[id]),
    }),
  ),
)(Photos);
