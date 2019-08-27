import React, { Component, Fragment } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import map from 'lodash/map';
import find from 'lodash/find';
import isEqual from 'lodash/isEqual';
import get from 'lodash/get';
import filter from 'lodash/filter';
import sortBy from 'lodash/sortBy';
import Button from '@/components/button';
import Post from './post';
import moment from 'moment';
import { api } from '@';
import { actions as messagesActions } from '@/store/messages';
import config from '@/config';
import style from './style.css';

class Spaces extends Component {
  state = {
    isNewMessagesLoading: false,
  };

  loadMessages = props => api.getMessages({ subscription_id: props.details_id, limit: config.items_per_page }).then(data => {
    this.props.loadMessages({chatId: props.details_id, list: data.messages, isLoaded: true});
  });

  loadMoreMessages = () => {
    this.setState({ isNewMessagesLoading: true });

    api.getMessages({ subscription_id: this.props.details_id, limit: config.items_per_page, offset: this.props.messages.length }).then(data => {
      this.setState({ isNewMessagesLoading: false });
      this.props.loadMoreMessages({chatId: this.props.details_id, list: data.messages});
    });
  };

  getGroupedMessages = () => {
    let messages = map(this.props.messages, id => this.props.messages_list[id]);
    messages = filter(messages, message => !message.xtag);
    messages = filter(messages, message => !message.deleted_at);
    messages = filter(messages, message => !message.in_reply_to_message_id);
    messages = filter(messages, message => !message.forwarded_message_id);
    messages = sortBy(messages, message => moment(message.created_at)).reverse();

    return messages;
  };

  isSomeMessageHasBeenDeleted = nextProps => {
    let hasDeleted = false;
    const messages = map(this.props.messages, id => this.props.messages_list[id]);

    messages.forEach(message => {
      const nextPropsMessage = find(nextProps.messages_list, { uid: message.uid });

      if (message.deleted_at !== nextPropsMessage.deleted_at) {
        hasDeleted = true;
      }
    });

    return hasDeleted;
  };

  componentDidMount() {
    if (!this.props.isLoaded) {
      this.loadMessages(this.props);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.details_id !== nextProps.details_id && !nextProps.isLoaded) {
      this.loadMessages(nextProps);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const isMessagesCountChanged = this.props.messages.length !== nextProps.messages.length;
    const isChatChanged = this.props.details_id !== nextProps.details_id;
    const isHasMoreChanged = this.props.hasMore !== nextProps.hasMore;
    const isSomeMessageHasBeenDeleted = this.isSomeMessageHasBeenDeleted(nextProps);
    const isStateChanged = !isEqual(this.state, nextState);

    return isMessagesCountChanged ||
      isChatChanged ||
      isHasMoreChanged ||
      isStateChanged ||
      isSomeMessageHasBeenDeleted;
  }

  render() {
    const groupedMessages = this.getGroupedMessages();
    const isHasMoreShown = this.props.hasMore && groupedMessages.length > 0;

    return <Fragment>
      {groupedMessages.map(message => <Post
        key={message.uid}
        uid={message.uid}
        className={style.post}
      />)}

      {isHasMoreShown &&
        <Button
          appearance="_basic-primary"
          text="Load more"
          className={style.load_more}
          onClick={this.loadMoreMessages}
          isLoading={this.state.isNewMessagesLoading}
        />
      }
    </Fragment>;
  }
}

export default compose(
  connect(
    (state, props) => ({
      isLoaded: get(state.messages, `chatIds.${props.details_id}.isLoaded`, false),
      hasMore: get(state.messages, `chatIds.${props.details_id}.hasMore`, false),
      messages: get(state.messages, `chatIds.${props.details_id}.list`, []),
      messages_list: state.messages.list,
    }),

    {
      loadMessages: messagesActions.loadMessages,
      loadMoreMessages: messagesActions.loadMoreMessages,
    },
  ),
)(Spaces);
