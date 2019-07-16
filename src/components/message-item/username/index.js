import React from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import Link from '@/components/link';

const Username = ({
  className,
  users_list,
  message,
}) => {
  const user = users_list[message.user_id];

  if (!user) {
    return null;
  }

  const userName = user.nick || 'no nick';

  return <Link to={`/chat/user/${user.id}`} className={className}>{userName}</Link>;
};

export default compose(
  connect(
    state => ({
      users_list: state.users.list,
    }),
  ),
)(Username);
