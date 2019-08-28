import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import classnames from 'classnames/bind';
import Link from '@/components/link';
import Icon from '@/components/icon';
import { actions as messagesActions } from '@/store/messages';
import { actions as usersActions } from '@/store/users';
import style from './style.css';

const cx = classnames.bind(style);

class FeedItem extends Component {
  componentWillMount() {
    this.props.addUsers(this.props.details.group.participants);
    this.props.loadMessages({chatId: this.props.details.id, list: []});
  }

  render() {
    return <Link className={cx('feed-item', this.props.className)} activeClassName="_is-active" to={`/chat/${this.props.id}`}>
      <Icon name="hashtag" />
      <p className={style.name}>{this.props.details.group.name}</p>

      {false &&
        <div className={style.point} />
      }
    </Link>;
  }
}

export default compose(
  connect(
    (state, props) => ({
      details: state.subscriptions.list[props.id],
    }),

    {
      addUsers: usersActions.addUsers,
      loadMessages: messagesActions.loadMessages,
    },
  ),
)(FeedItem);
