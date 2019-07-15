import React, { Component } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames/bind';
import compose from 'recompose/compose';
import SubscriptionAvatar from '@/components/subscription-avatar';
import style from './style.css';

const cx = classnames.bind(style);

export class Suggestion extends Component {
  componentDidMount() {
    window.addEventListener('click', event => {
      if (this.suggestionRef && !this.suggestionRef.contains(event.target)) {
        this.props.onClose();
      }
    });
  }

  render() {
    return <div className={cx('suggestion', this.props.className)} ref={node => this.suggestionRef = node}>
      {this.props.details.group.participants.map(participant => {
        const user = this.props.users_list[participant.user.id];

        if (!user || !user.nick) {
          return;
        }

        if (this.props.search && !user.nick.toLowerCase().startsWith(this.props.search.toLowerCase())) {
          return;
        }

        return <button key={user.id} className={style.item} onClick={() => this.props.onSelect(user.nick)}>
          <SubscriptionAvatar subscription={this.props.details} userId={user.id} className={style.avatar} />
          <p className={style.name}>{user.nick}</p>
        </button>;
      })}
    </div>;
  }
}

export default compose(
  connect(
    (state, props) => ({
      details: state.subscriptions.list[props.subscription_id] || null,
      users_list: state.users.list,
    }),
  ),
)(Suggestion);
