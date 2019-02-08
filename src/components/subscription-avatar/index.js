import React, { Component } from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';
import Avatar from '@/components/avatar';
import { getChatName, getOpponentUser } from '@/helpers';

class SubscriptionAvatar extends Component {
  getLetter = () => {
    if (this.props.user) {
      return (get(this.props.user, 'nick', 'no nick') || 'no nick')[0];
    }

    if (this.props.subscription) {
      return getChatName(this.props.subscription)[0];
    }
  }

  getPhoto = () => {
    if (this.props.user) {
      return get(this.props.user, 'avatar.small', '/assets/default-user.jpg');
    }

    if (!this.props.subscription) {
      return;
    }

    if (this.props.subscription.group.type === 'private_chat' && this.props.subscription.group.participants.length === 2) {
      const oppponent = getOpponentUser(this.props.subscription);
      return get(this.props.users_list[oppponent.id], 'avatar.small', '/assets/default-user.jpg');
    }

    return get(this.props.subscription.group, 'icon.small');
  };

  render() {
    const letter = this.getLetter();
    const photo = this.getPhoto();
    const isSubscriptionGroup = this.props.subscription && this.props.subscription.group.type !== 'private_chat';

    return <Avatar
      className={this.props.className}
      isGroup={isSubscriptionGroup}
      {...photo ? { photo } : {}}
      {...!photo ? { letter } : {}}
    />;
  }
}

export default connect(
  (state, props) => ({
    ...props.userId ? { user: state.users.list[props.userId] } : null,
    // что бы обновлялся компонент при обновлении users
    users: state.users,
    users_list: state.users.list,
  }),
)(SubscriptionAvatar);
