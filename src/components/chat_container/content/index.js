import React from 'react';
import compose from 'recompose/compose';
import Messages from '@/components/messages_container';
import Feed from '@/components/feed_container';
import { withDetails } from '@/hoc';

const Content = ({ details, ...props }) => {
  if (!details) {
    return null;
  }

  if (details.group.is_space) {
    return <Feed {...props} />;
  }

  return <Messages {...props} />;
};

export default compose(
  withDetails,
)(Content);