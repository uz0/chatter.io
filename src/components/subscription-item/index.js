import React, { Component } from 'react';
import compose from 'recompose/compose';
import find from 'lodash/find';
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';
import { connect } from 'react-redux';
import Link from '@/components/link';
import classnames from 'classnames/bind';
import { withNamespaces } from 'react-i18next';
import SubscriptionAvatar from '@/components/subscription-avatar';
import Message from './message';
import { api } from '@';
import { withTypings } from '@/hoc';
import { actions as subscriptionsActions } from '@/store/subscriptions';
import { actions as messagesActions } from '@/store/messages';
import { actions as usersActions } from '@/store/users';
import { getOpponentUser, getChatName } from '@/helpers';
import style from './style.css';

const cx = classnames.bind(style);

class SubscriptionItem extends Component {
  loadLastMessage = () => {
    api.getMessages({ subscription_id: this.props.id, limit: 1 }).then(data => {
      this.props.loadMessages({chatId: this.props.id, list: data.messages});
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
        ...subscription,
        invite_code: data.code,
      });
    });
  };

  loadSubscription = () => {
    if (this.props.subscription) {
      this.props.addUsers(this.props.subscription.group.participants);
      return;
    }

    api.getSubscription({ subscription_id: this.props.id }).then(data => {
      this.props.loadSubscription(data.subscription);
      this.props.addUsers(data.subscription.group.participants);
      this.loadInviteCode(data.subscription);
    }).catch(error => {
      console.error(error);
    });
  };

  click = () => this.props.onClick(this.props.subscription);

  componentWillMount() {
    if (this.props.withLoadData && !this.props.subscription) {
      this.loadLastMessage();
      this.loadSubscription();
    }
  }

  shouldComponentUpdate(nextProps) {
    const isSubscriptionLoaded = !this.props.subscription && !!nextProps.subscription;
    const isLastMessageChanged = !isEqual(this.props.lastMessage, nextProps.lastMessage);
    const isSubscriptionChanged = !isEqual(this.props.subscription, nextProps.subscription);
    const isTypingsChanged = !isEqual(this.props.typings, nextProps.typings);
    const isClassNameChanged = !isEqual(this.props.className, nextProps.className);

    return isSubscriptionLoaded || isLastMessageChanged || isSubscriptionChanged || isTypingsChanged || isClassNameChanged;
  }

  render() {
    if (!this.props.subscription) {
      return null;
    }

    const chatName = getChatName(this.props.subscription);
    let href = '';

    if (this.props.subscription.group.type === 'private_chat' && !isEmpty(getOpponentUser(this.props.subscription))) {
      href = `/chat/user/${getOpponentUser(this.props.subscription).id}`;
    } else {
      href = `/chat/${this.props.id}`;
    }

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
  withNamespaces('translation'),

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
        ...lastMessage ? { lastMessage } : {},
      };
    },

    {
      loadSubscription: subscriptionsActions.loadSubscription,
      updateSubscription: subscriptionsActions.updateSubscription,
      loadMessages: messagesActions.loadMessages,
      addUsers: usersActions.addUsers,
    },
  ),

  withTypings(props => ({
    chat: props.subscription,
  })),
)(SubscriptionItem);
