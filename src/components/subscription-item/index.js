import React, { Component } from 'react';
import compose from 'recompose/compose';
import find from 'lodash/find';
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';
import { connect } from 'react-redux';
import Link from '@/components/link';
import classnames from 'classnames/bind';
import { withTranslation } from 'react-i18next';
import SubscriptionAvatar from '@/components/subscription-avatar';
import Message from './message';
import { api } from '@';
import { withTypings } from '@/hoc';
import { actions as subscriptionsActions } from '@/store/subscriptions';
import { actions as messagesActions } from '@/store/messages';
import { actions as usersActions } from '@/store/users';
import { getChatUrl, getChatName } from '@/helpers';
import style from './style.css';

const cx = classnames.bind(style);

class SubscriptionItem extends Component {
  loadLastMessage = subscription => {
    api.getMessages({ subscription_id: subscription.id, limit: 1 }).then(data => {
      this.props.loadMessages({chatId: subscription.id, list: data.messages});
      this.props.updateSubscription({ id: subscription.id, is_add_data_loaded: true });
    });
  };

  loadInviteCode = subscription => {
    if (subscription.group.type !== 'room') {
      return;
    }

    const currentUserParticipant = this.props.currentUser && find(subscription.group.participants, { user_id: this.props.currentUser.id });
    const isCurrentUserAdmin = currentUserParticipant && currentUserParticipant.role === 'admin';

    if (!isCurrentUserAdmin) {
      return;
    }

    api.createGroupInviteCode({ subscription_id: subscription.id }).then(data => {
      this.props.updateSubscription({
        id: subscription.id,
        invite_code: data.code,
      });
    });
  };

  addUsers = async participants => {
    for (let i = 0; i < participants.length; i++) {
      const user = participants[i].user;

      if (!user || user.id === this.props.currentUser.id) {
        continue;
      }

      if (this.props.users_list[user.id] && 'last_active_at' in this.props.users_list[user.id]) {
        continue;
      }

      const response = await api.getLastActiveAt({user_id: user.id});
      participants[i].user['last_active_at'] = response.last_active_at;
    }

    this.props.addUsers(participants);
  };

  click = () => this.props.onClick(this.props.subscription);

  componentWillMount() {
    if (this.props.withLoadData && !this.props.subscription.is_add_data_loaded) {
      this.loadLastMessage(this.props.subscription);
      this.addUsers(this.props.subscription.group.participants);
      this.loadInviteCode(this.props.subscription);
    }
  }

  shouldComponentUpdate(nextProps) {
    const isLastMessageChanged = !isEqual(this.props.lastMessage, nextProps.lastMessage);
    const isSubscriptionChanged = !isEqual(this.props.subscription, nextProps.subscription);
    const isTypingsChanged = !isEqual(this.props.typings, nextProps.typings);
    const isClassNameChanged = !isEqual(this.props.className, nextProps.className);

    return isLastMessageChanged || isSubscriptionChanged || isTypingsChanged || isClassNameChanged;
  }

  render() {
    const chatName = getChatName(this.props.subscription);
    const href = getChatUrl();

    const isLastMessageShown = this.props.lastMessage && !this.props.typings;
    const isUnreadShown = !this.props.messageId && this.props.lastMessage && this.props.lastMessage.id !== this.props.subscription.last_read_message_id;

    return <Link
      {...this.props.withLoadData ? {to: href} : {}}
      {...this.props.withLoadData ? {activeClassName: '_is-active'} : {}}
      {...!this.props.withLoadData ? {onClick: this.click} : {}}
      {...this.props.withDataId ? {'data-subscription-id': this.props.id} : {}}
      className={cx('subscription', this.props.className)}
    >
      <SubscriptionAvatar
        subscription={this.props.subscription}
        className={style.avatar}
      />

      <div className={cx('content', {'_is-unread': isUnreadShown})}>
        <p className={style.name}>{chatName}</p>

        {isLastMessageShown &&
          <Message message={this.props.lastMessage} className={style.message} />
        }

        {!isEmpty(this.props.typings) &&
          <p className={cx('message', 'text')}>{this.props.typings}</p>
        }
      </div>

      {isUnreadShown &&
        <div className={style.point} />
      }

      {false && <div className={style.last_photo} style={{ '--photo': 'url(/assets/default-user.jpg)' }} />}
      {false && <span className={style.last_count}>+3</span>}
    </Link>;
  }
}

export default compose(
  withTranslation(),

  connect(
    (state, props) => {
      let lastMessage = null;

      if (state.messages.chatIds[props.id] && !props.messageId) {
        lastMessage = state.messages.list[state.messages.chatIds[props.id].list[0]];
      }

      if (props.messageId) {
        lastMessage = state.messages.list[props.messageId];
      }

      return {
        currentUser: state.currentUser,
        subscription: state.subscriptions.list[props.id] || null,
        users_list: state.users.list,
        ...lastMessage ? { lastMessage } : {},
      };
    },

    {
      updateSubscription: subscriptionsActions.updateSubscription,
      loadMessages: messagesActions.loadMessages,
      addUsers: usersActions.addUsers,
      updateUser: usersActions.updateUser,
    },
  ),

  withTypings(props => ({
    chat: props.subscription,
  })),
)(SubscriptionItem);
