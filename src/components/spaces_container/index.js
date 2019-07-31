import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import map from 'lodash/map';
import get from 'lodash/get';
import filter from 'lodash/filter';
import sortBy from 'lodash/sortBy';
import classnames from 'classnames/bind';
import SubscriptionAvatar from '@/components/subscription-avatar';
import Button from '@/components/button';
import Post from './post';
import moment from 'moment';
import { withDetails } from '@/hoc';
import { api } from '@';
import { actions as messagesActions } from '@/store/messages';
import { itemsPerPage } from '@/components/messages_container';
import style from './style.css';

const cx = classnames.bind(style);

class Spaces extends Component {
  state = {
    isNewMessagesLoading: false,
  };

  loadMessages = props => api.getMessages({ subscription_id: props.details.id, limit: itemsPerPage }).then(data => {
    this.props.loadMessages({chatId: props.details.id, list: data.messages, isLoaded: true});
  });

  loadMoreMessages = () => {
    this.setState({ isNewMessagesLoading: true });

    api.getMessages({ subscription_id: this.props.details.id, limit: itemsPerPage, offset: this.props.chatIds.list.length }).then(data => {
      this.setState({ isNewMessagesLoading: false });
      this.props.loadMoreMessages({chatId: this.props.details.id, list: data.messages});
    });
  };

  getGroupedMessages = () => {
    if (!this.props.details) {
      return [];
    }

    if (!this.props.chatIds) {
      return [];
    }

    let messages = map(this.props.chatIds.list, id => this.props.messages_list[id]);
    messages = filter(messages, message => !message.xtag);
    messages = filter(messages, message => !message.deleted_at);
    messages = filter(messages, message => !message.in_reply_to_message_id);
    messages = filter(messages, message => !message.forwarded_message_id);
    messages = sortBy(messages, message => moment(message.created_at)).reverse();

    return messages;
  };

  componentDidMount() {
    const isMessagesLoaded = get(this.props, 'chatIds.isLoaded', false);

    if (this.props.details && !isMessagesLoaded) {
      this.loadMessages(this.props);
    }
  }

  componentWillReceiveProps(nextProps) {
    const isMessagesLoaded = get(nextProps, 'chatIds.isLoaded', false);
    const isChatChanged = this.props.details && nextProps.details && this.props.details.id !== nextProps.details.id;

    // если страница загружается сразу с открытым чатом, details еще не успевает прийти, ловим тут
    if (!this.props.details && nextProps.details && !isMessagesLoaded) {
      this.loadMessages(nextProps);
    }

    // если перешли в другой чат из существующего и в нем не прогружены сообщения
    if (isChatChanged && !isMessagesLoaded) {
      this.loadMessages(nextProps);
    }
  }

  render() {
    const isHasMoreMessages = this.props.chatIds && this.props.chatIds.hasMore;
    const groupedMessages = this.getGroupedMessages();

    return <div className={cx('spaces', this.props.className)}>
      <h3 className={style.title}>#{this.props.details.group.name}</h3>
      <p className={style.subtitle}>Public space</p>

      <div className={style.input_container}>
        <SubscriptionAvatar userId={this.props.currentUser.id} className={style.avatar} />
        <input placeholder="Post to #design" className={style.input} />
        <Button appearance="_fab-divider" icon="plus" className={style.action} />
      </div>

      {groupedMessages.map(message => <Post
        key={message.id || message.uid}
        id={message.id || message.uid}
        className={style.post}
      />)}

      {isHasMoreMessages &&
        <Button
          appearance="_basic-primary"
          text="Load more"
          className={style.load_more}
          onClick={this.loadMoreMessages}
          isLoading={this.state.isNewMessagesLoading}
        />
      }
    </div>;
  }
}

export default compose(
  withDetails,

  connect(
    (state, props) => ({
      currentUser: state.currentUser,
      messages_list: state.messages.list,
      chatIds: props.details ? state.messages.chatIds[props.details.id] : null,
    }),

    {
      loadMessages: messagesActions.loadMessages,
      loadMoreMessages: messagesActions.loadMoreMessages,
    },
  ),
)(Spaces);
