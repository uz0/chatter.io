import React from 'react';
import SubscriptionAvatar from '@/components/subscription-avatar';
import style from './style.css';

const Message = ({
  user,
}) => {
  const isOpponentMessage = user === 'opponent';

  return <div className={style.message} data-user={user}>
    {isOpponentMessage &&
      <SubscriptionAvatar userId={55} className={style.avatar} />
    }

    <div className={style.section}>
      {isOpponentMessage &&
        <p className={style.name}>Mark Trubnikov</p>
      }

      <p className={style.text}>This feature is contextually sensitive and will convert "words" of numbers separated by forward slash into proper fractions. </p>
    </div>
  </div>;
};

export default Message;
