import React from 'react';
import compose from 'recompose/compose';
import map from 'lodash/map';
import filter from 'lodash/filter';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { actions as messagesActions } from '@/store/messages';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

const Photos = ({ t, scrollToMessage, messages, className }) => {
  const messagesWithImages = filter(messages, message => message.attachment && message.attachment.content_type.match('image/'));
  const isImagesExist = messagesWithImages.length > 0;
  let emptyMessage = t('empty_message', {entity: t('photo_plural')}).toLowerCase();
  emptyMessage = emptyMessage.charAt(0).toUpperCase() + emptyMessage.slice(1);

  return <div className={cx(style.list, className)}>
    {isImagesExist &&
      messagesWithImages.map(message => <div
        className={style.photo}
        style={{ '--image': `url(${message.attachment.preview})` }}
        onClick={() => scrollToMessage(message.id || message.uid)}
      />)
    }

    {!isImagesExist &&
      <p className={style.empty}>{emptyMessage}</p>
    }
  </div>;
};

export default compose(
  withNamespaces('translation'),

  connect(
    (state, props) => ({
      messages: map(state.messages.chatIds[props.details.id].list, id => state.messages.list[id]),
    }),

    {
      scrollToMessage: messagesActions.scrollToMessage,
    },
  ),
)(Photos);
