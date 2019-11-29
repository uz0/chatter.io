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
    const isUnreadShown = this.props.lastMessage &&
      this.props.lastMessage.id &&
      this.props.lastMessage.user_id !== this.props.currentUser.id &&
      this.props.details.last_read_message_id !== this.props.lastMessage.id;

    let href;

    if (this.props.details.group.organization_id) {
      href = `/${this.props.details.group.organization_id}/chat/${this.props.id}`;
    } else {
      href = `/chat/${this.props.id}`;
    }

    return <Link className={cx('feed-item', this.props.className)} activeClassName="_is-active" to={href}>
      <Icon name="hashtag" />
      <p className={style.name}>{this.props.details.group.name}</p>

      {isUnreadShown &&
        <div className={style.point} />
      }
    </Link>;
  }
}

export default compose(
  connect(
    (state, props) => {
      let lastMessage = null;

      if (state.messages.chatIds[props.id]) {
        lastMessage = state.messages.list[state.messages.chatIds[props.id].list[0]];
      }

      return {
        currentUser: state.currentUser,
        details: state.subscriptions.list[props.id],
        ...lastMessage ? { lastMessage } : {},
      };
    },

    {
      addUsers: usersActions.addUsers,
      loadMessages: messagesActions.loadMessages,
    },
  ),
)(FeedItem);
