import React from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';

const Username = ({
  className,
  users_list,
  message,
}) => {
  const user = users_list[message.user_id];
  const userName = user.nick || 'no nick';

  return <p className={className}>{userName}</p>;
};

export default compose(
  connect(
    state => ({
      users_list: state.users.list,
    }),
  ),
)(Username);
