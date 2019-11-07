import React from 'react';
import compose from 'recompose/compose';
import withHandlers from 'recompose/withHandlers';
import { connect } from 'react-redux';
import Button from '@/components/button';
import { api } from '@';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

const PinnedMessage = ({
  message,
  unpinMessage,
  className,
}) => {
  if (!message) {
    return null;
  }

  return <div className={cx('pin', className)}>
    <div className={style.section}>
      <p className={style.title}>Pinned message</p>
      <p className={style.text}>{message.text}</p>
    </div>

    <Button appearance="_icon-transparent" icon="close" className={style.close} onClick={unpinMessage} />
  </div>;
};

export default compose(
  connect(
    (state, props) => ({
      details: state.subscriptions.list[props.details_id],
    }),
  ),

  connect(
    (state, props) => ({
      message: state.messages.list[props.details.group.pinned_message_id],
    }),
  ),

  withHandlers({
    unpinMessage: props => () => {
      api.updateGroup({ subscription_id: props.details_id, pinned_message_id: '' });
    },
  }),
)(PinnedMessage);
