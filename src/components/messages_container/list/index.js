import React, { Component } from 'react';
import map from 'lodash/map';
import get from 'lodash/get';
import groupBy from 'lodash/groupBy';
import moment from 'moment';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import classnames from 'classnames/bind';
import DateDelimiter from './date-delimiter';
import XtagDelimiter from './xtag-delimiter';
import UnreadDelimiter from './unread-delimiter';
import MessageItem from './message-item';
import Button from '@/components/button';
import { withRouter } from '@/hoc';
import { api } from '@';
import { actions as messagesActions } from '@/store/messages';
import config from '@/config';
import style from './style.css';

const cx = classnames.bind(style);

class List extends Component {
  state = {
    isNewMessagesLoading: false,
  };

  scrollListMessagesToBottom = () => {
    const list = document.getElementById('messages-scroll');

    if (list) {
      list.scrollTo(0, list.scrollHeight);
    }
  };

  loadMessages = props => {
    this.setState({ isMessagesLoading: true });

    api.getMessages({ subscription_id: props.details_id, limit: config.items_per_page }).then(data => {
      this.props.loadMessages({chatId: props.details_id, list: data.messages, isLoaded: true});
      this.setState({ isMessagesLoading: false });
      this.scrollListMessagesToBottom();
    });
  };

  loadMoreMessages = () => {
    this.setState({ isNewMessagesLoading: true });
    const lastElement = document.querySelector('[data-message-id]');
    const id = lastElement.getAttribute('data-message-id');

    api.getMessages({ subscription_id: this.props.details_id, limit: config.items_per_page, offset: this.props.messages.length }).then(data => {
      this.setState({ isNewMessagesLoading: false });
      this.props.loadMoreMessages({chatId: this.props.details_id, list: data.messages});
      const element = document.querySelector(`[data-message-id="${id}"]`);
      element.scrollIntoView({ block: 'start' });
    });
  };

  getGroupedMessages = () => {
    if (!this.props.messages) {
      return [];
    }

    const { tagname } = this.props.match.params;
    let messagesIds = this.props.messages;

    if (tagname) {
      const tagreg = /\B\#\w\w+\b/gim;

      messagesIds = messagesIds.filter(id => {
        const message = this.props.messages_list[id];
        const messageTags = (message.text && message.text.match(tagreg)) || [];
        const hasHastag = messageTags.includes(`#${tagname}`);

        if (hasHastag) {
          return id;
        }
      });
    }

    const groupedByDate = groupBy(
      map(messagesIds, id => this.props.messages_list[id]),
      message => moment(message.created_at).format('YYYY-MM-DD'),
    );

    const dates = Object.keys(groupedByDate).sort();
    let groupedMessages = [];

    dates.forEach(date => {
      groupedMessages.push({ type: 'dateDelimiter', date });
      const messagesPerDay = groupedByDate[date].sort((prev, next) => new Date(prev.created_at) - new Date(next.created_at));

      messagesPerDay.forEach((message, index) => {
        const message_uid = message.uid;
        const isMessageOpponent = message.user_id !== this.props.currentUserId;
        const isPrevMessageIsLastRead = messagesPerDay[index - 1] && messagesPerDay[index - 1].id === this.props.last_read_message_id;
        const isOpponentMessageUnread = isMessageOpponent && isPrevMessageIsLastRead;

        if (message.xtag) {
          groupedMessages.push({ type: 'xtagDelimiter', message_uid });
          return;
        }

        if (isOpponentMessageUnread) {
          groupedMessages.push({ type: 'unreadDelimiter' });
        }

        groupedMessages.push({ type: 'message', message_uid });
      });
    });

    groupedMessages.forEach((grouped, index) => {
      if (grouped.type !== 'message') {
        return;
      }

      const messageType = this.getMessageType(groupedMessages, index);
      grouped['message_type'] = messageType;
    });

    return groupedMessages;
  };

  getMessageType = (groupedMessages, index) => {
    const last_message_id = groupedMessages[index - 1] && groupedMessages[index - 1].type === 'message' ? groupedMessages[index - 1].message_id : null;
    const message_id = groupedMessages[index].message_id;
    const next_message_id = groupedMessages[index + 1] && groupedMessages[index + 1].type === 'message' ? groupedMessages[index + 1].message_id : null;

    if (!last_message_id && !next_message_id) {
      return 'single';
    }

    const last_message = this.props.messages_list[last_message_id];
    const message = this.props.messages_list[message_id];
    const next_message = this.props.messages_list[next_message_id];

    if (!last_message && next_message) {
      if (next_message.user_id !== message.user_id) {
        return 'single';
      }

      if (message.user_id === next_message.user_id) {
        return 'first';
      }
    }

    if (last_message && !next_message) {
      if (last_message.user_id !== message.user_id) {
        return 'single';
      }

      if (last_message.user_id === message.user_id) {
        return 'last';
      }
    }

    if (last_message && next_message) {
      if (last_message.user_id !== message.user_id && next_message.user_id !== message.user_id) {
        return 'single';
      }

      if (last_message.user_id !== message.user_id && next_message.user_id === message.user_id) {
        return 'first';
      }

      if (last_message.user_id === message.user_id && next_message.user_id === message.user_id) {
        return 'middle';
      }

      if (last_message.user_id === message.user_id && next_message.user_id !== message.user_id) {
        return 'last';
      }
    }
  };

  isHasUnread = (last_read_message_id, lastMessage) => {
    if (!lastMessage) {
      return false;
    }

    if (last_read_message_id === lastMessage.id) {
      return false;
    }

    return true;
  };

  readLastMessage = (subscription_id, last_read_message_id) => api.updateSubscription({
    subscription_id,
    last_read_message_id,
  });

  componentDidMount() {
    if (this.isHasUnread(this.props.last_read_message_id, this.props.lastMessage)) {
      this.readLastMessage(this.props.details_id, this.props.lastMessage.id);
    }

    if (!this.props.isLoaded) {
      this.loadMessages(this.props);
    }

    if (this.props.isLoaded) {
      this.scrollListMessagesToBottom();
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const isMessagesCountChanged = this.props.messages.length !== nextProps.messages.length;
    const isCurrentUserChanged = this.props.currentUserId !== nextProps.currentUserId;
    const isLastMessageChanged = get(this.props, 'lastMessage.uid', '') !== get(nextProps, 'lastMessage.uid', '');
    const isHasMoreChanged = this.props.hasMore !== nextProps.hasMore;
    const isLoadedChanged = this.props.isLoaded !== nextProps.isLoaded;
    const isGalleryChangeState = this.props.isGalleryOpen !== nextProps.isGalleryOpen;
    const isLastReadMessageChanged = this.props.last_read_message_id !== nextProps.last_read_message_id;
    const isTagChanged = this.props.match.params.tagname !== nextProps.match.params.tagname;
    const isLoadingChanged = this.state.isNewMessagesLoading !== nextState.isNewMessagesLoading;

    return isMessagesCountChanged ||
      isCurrentUserChanged ||
      isLastMessageChanged ||
      isHasMoreChanged ||
      isLoadedChanged ||
      isGalleryChangeState ||
      isLastReadMessageChanged ||
      isLoadingChanged ||
      isTagChanged;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.details_id !== nextProps.details_id && !nextProps.isLoaded) {
      this.loadMessages(nextProps);
    }

    // если перешли в другой чат - нужно опускать скролл вниз
    // скролл опускается вниз в this.loadMessages, но она не сработает если там уже загружены сообщения
    if (this.props.details_id !== nextProps.details_id) {
      setTimeout(() => this.scrollListMessagesToBottom());
    }
  }

  componentWillUnmount() {
    if (this.isHasUnread(this.props.last_read_message_id, this.props.lastMessage)) {
      this.readLastMessage(this.props.details_id, this.props.lastMessage.id);
    }
  }

  render() {
    if (this.props.match.params.messageId) {
      setTimeout(() => {
        const element = document.querySelector(`[data-message-id="${this.props.match.params.messageId}"]`);

        if (!element) {
          return;
        }

        element.scrollIntoView({ block: 'center', behavior: 'smooth' });
        let url;

        if (this.props.match.params.chatId) {
          url = `/chat/${this.props.match.params.chatId}`;
        }

        if (this.props.match.params.userId) {
          url = `/chat/user/${this.props.match.params.userId}`;
        }

        this.props.replaceUrl(url);
      });
    }

    const groupedMessages = this.getGroupedMessages();
    const isHasMoreShown = this.props.hasMore && groupedMessages.length > 0;

    return <div
      id="messages-scroll"
      data-chat-id={this.props.details_id}
      className={cx('list', {'_is-gallery-open': this.props.isGalleryOpen}, this.props.className)}
    >
      {isHasMoreShown &&
        <Button
          appearance="_basic-primary"
          text="Load more"
          className={style.load_more}
          onClick={this.loadMoreMessages}
          isLoading={this.state.isNewMessagesLoading}
        />
      }

      {groupedMessages.map(message => {
        if (message.type === 'unreadDelimiter') {
          return <UnreadDelimiter
            key="unread-delimiter"
            className={style.item}
          />;
        }

        if (message.type === 'xtagDelimiter') {
          return <XtagDelimiter
            key={message.message_uid}
            id={message.message_uid}
            className={style.item}
          />;
        }

        if (message.type === 'dateDelimiter') {
          return <DateDelimiter
            key={message.date}
            date={message.date}
            className={style.item}
          />;
        }

        return <MessageItem
          key={message.message_uid}
          uid={message.message_uid}
          type={message.message_type}
          className={cx('message', 'item')}
        />;
      })}
    </div>;
  }
}

export default compose(
  withRouter,

  connect(
    (state, props) => ({
      currentUserId: state.currentUser.id,
      isGalleryOpen: state.gallery.images.length > 0,
      isLoaded: get(state.messages, `chatIds.${props.details_id}.isLoaded`, false),
      hasMore: get(state.messages, `chatIds.${props.details_id}.hasMore`, false),
      messages: get(state.messages, `chatIds.${props.details_id}.list`, []),
      messages_list: state.messages.list,
      last_read_message_id: get(state.subscriptions.list[props.details_id], 'last_read_message_id', null),
    }),

    {
      loadMessages: messagesActions.loadMessages,
      loadMoreMessages: messagesActions.loadMoreMessages,
    },
  ),

  connect(
    (state, props) => ({
      ...props.messages ? { lastMessage: state.messages.list[props.messages[0]] } : {},
    }),
  ),
)(List);