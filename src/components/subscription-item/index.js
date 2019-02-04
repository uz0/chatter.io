import React, { Component } from 'react';
import compose from 'recompose/compose';
import isEmpty from 'lodash/isEmpty';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import classnames from 'classnames/bind';
import SubscriptionAvatar from '@/components/subscription-avatar';
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

  componentWillMount() {
    this.loadLastMessage();

    api.getSubscription({ subscription_id: this.props.id }).then(data => {
      this.props.loadSubscription(data.subscription);
      this.props.addUsers(data.subscription.group.participants);
    });
  }

  render() {
    if (!this.props.subscription) {
      return null;
    }

    let href = '';

    if (this.props.subscription.group.type === 'private_chat' && !isEmpty(getOpponentUser(this.props.subscription))) {
      href = `/chat/user/${getOpponentUser(this.props.subscription).id}`;
    } else {
      href = `/chat/${this.props.id}`;
    }

    return <Link
      to={href}
      activeClassName="_is-active"
      className={cx('subscription', this.props.className)}
    >
      <SubscriptionAvatar
        subscription={this.props.subscription}
        className={style.avatar}
      />

      <div className={style.content}>
        <p className={style.name}>{getChatName(this.props.subscription)}</p>

        <div className={style.section}>
          <p className={style.text}>Test picture</p>
          <span className={style.time}>09:23</span>
        </div>
      </div>

      {false && <div className={style.point} />}
      {false && <div className={style.last_photo} style={{ '--photo': 'url(/assets/default-user.jpg)' }} />}
      {false && <span className={style.last_count}>+3</span>}
    </Link>;
  }
}

export default compose(
  connect(
    (state, props) => ({
      subscription: state.subscriptions.list[props.id] || null,
    }),

    {
      loadSubscription: subscriptionsActions.loadSubscription,
      loadMessages: messagesActions.loadMessages,
      addUsers: usersActions.addUsers,
    },
  ),
)(SubscriptionItem);
