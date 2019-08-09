import React from 'react';
import compose from 'recompose/compose';
import Messages from '@/components/messages_container';
import Spaces from '@/components/spaces_container';
import { withDetails } from '@/hoc';

const Content = ({ details, ...props }) => {
  if (!details) {
    return null;
  }

  if (details.group.is_space) {
    return <Spaces {...props} />;
  }

  return <Messages {...props} />;
};

export default compose(
  withDetails,
)(Content);