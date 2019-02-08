import React, { Component } from 'react';
import compose from 'recompose/compose';
import isEmpty from 'lodash/isEmpty';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import classnames from 'classnames/bind';
import { withNamespaces } from 'react-i18next';
import SubscriptionAvatar from '@/components/subscription-avatar';
import Message from './message';
import { api } from '@';
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

  loadSubscription = () => {
    if (this.props.subscription) {
      this.props.addUsers(this.props.subscription.group.participants);
      return;
    }

    api.getSubscription({ subscription_id: this.props.id }).then(data => {
      this.props.loadSubscription(data.subscription);
      this.props.addUsers(data.subscription.group.participants);
    });
  };

  click = () => this.props.onClick(this.props.subscription);

  componentWillMount() {
    if (this.props.withLoadData) {
      this.loadLastMessage();
      this.loadSubscription();
    }
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

    const isLastMessageShown = this.props.lastMessage && !this.props.subscription.draft;

    return <Link
      {...this.props.withLoadData ? {to: href} : {}}
      {...this.props.withLoadData ? {activeClassName: '_is-active'} : {}}
      {...!this.props.withLoadData ? {onClick: this.click} : {}}
      className={cx('subscription', this.props.className)}
    >
      <SubscriptionAvatar
        subscription={this.props.subscription}
        className={style.avatar}
      />

      <div className={style.content}>
        <p className={style.name}>{chatName}</p>

        {isLastMessageShown &&
          <Message message={this.props.lastMessage} className={style.message} />
        }

        {this.props.subscription.draft &&
          <p className={cx('message', 'text')}>{this.props.t('draft')}: {this.props.subscription.draft}</p>
        }
      </div>

      {false && <div className={style.point} />}
      {false && <div className={style.last_photo} style={{ '--photo': 'url(/assets/default-user.jpg)' }} />}
      {false && <span className={style.last_count}>+3</span>}
    </Link>;
  }
}

export default compose(
  withNamespaces('translation'),

  connect(
    (state, props) => ({
      subscription: state.subscriptions.list[props.id] || null,
      ...state.messages.chatIds[props.id] ? { lastMessage: state.messages.list[state.messages.chatIds[props.id].list[0]] } : {},
    }),

    {
      loadSubscription: subscriptionsActions.loadSubscription,
      loadMessages: messagesActions.loadMessages,
      addUsers: usersActions.addUsers,
    },
  ),
)(SubscriptionItem);
