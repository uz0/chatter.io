import React from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import SubscriptionAvatar from '@/components/subscription-avatar';
import style from './style.css';

const Message = ({
  currentUserId,
  comment,
}) => {
  const author = comment.user_id === currentUserId ? 'current' : 'opponent';
  const isOpponentMessage = author === 'opponent';
  const name = comment.user.nick || 'no nick';

  return <div className={style.message} data-user={author}>
    {isOpponentMessage &&
      <SubscriptionAvatar userId={comment.user_id} className={style.avatar} />
    }

    <div className={style.section}>
      {isOpponentMessage &&
        <p className={style.name}>{name}</p>
      }

      <p className={style.text}>{comment.text}</p>
    </div>
  </div>;
};

export default compose(
  connect(
    (state, props) => ({
      currentUserId: state.currentUser.id,
      comment: state.tasks.list[props.task_id].comments.list[props.id],
    }),
  ),
)(Message);
