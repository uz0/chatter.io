import React, { Component } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import map from 'lodash/map';
import groupBy from 'lodash/groupBy';
import moment from 'moment';
import classnames from 'classnames/bind';
import { withTranslation } from 'react-i18next';
import Header from './header';
import MessageInput from './input';
import Button from '@/components/button';
import DateDelimiter from './date-delimiter';
import XtagDelimiter from './xtag-delimiter';
import UnreadDelimiter from './unread-delimiter';
import Typings from './typings';
import MessageItem from '@/components/message-item';
import { withDetails, withRouter } from '@/hoc';
import { scrollMessagesBottom } from '@/helpers';
import { api } from '@';
import { actions as messagesActions } from '@/store/messages';
import style from './style.css';

const cx = classnames.bind(style);
export const itemsPerPage = 50;

class Messages extends Component {
  state = {
    isMessagesLoading: false,
    isNewMessagesLoading: false,
  };

  getGroupedMessages = () => {
    if (!this.props.details) {
      return [];
    }

    if (!this.props.chatIds) {
      return [];
    }

    const { tagname } = this.props.params;
    let messagesIds = this.props.chatIds.list;

    if (tagname) {
      // eslint-disable-next-line no-useless-escape
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
        const message_id = message.id || message.uid;
        const message_uid = message.uid;
        const isMessageOpponent = message.user_id !== this.props.currentUser.id;
        const isPrevMessageIsLastRead = messagesPerDay[index - 1] && messagesPerDay[index - 1].id === this.props.details.last_read_message_id;
        const isOpponentMessageUnread = isMessageOpponent && isPrevMessageIsLastRead;

        if (message.xtag) {
          groupedMessages.push({ type: 'xtagDelimiter', message_id });
          return;
        }

        if (isOpponentMessageUnread) {
          groupedMessages.push({ type: 'unreadDelimiter' });
        }

        groupedMessages.push({ type: 'message', message_id, message_uid });
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

  loadMessages = props => {
    this.setState({ isMessagesLoading: true });

    api.getMessages({ subscription_id: props.details.id, limit: itemsPerPage }).then(data => {
      this.props.loadMessages({chatId: props.details.id, list: data.messages, isLoaded: true});
      this.setState({ isMessagesLoading: false });
      this.scrollListMessagesToBottom();
    });
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

  readLastMessage = (subscription_id, last_read_message_id) => api.updateSubscription({
    subscription_id,
    last_read_message_id,
  });

  isHasUnread = (chat, lastMessage) => {
    if (!lastMessage) {
      return false;
    }

    if (chat.last_read_message_id === lastMessage.id) {
      return false;
    }

    return true;
  };

  scrollListMessagesToBottom = () => this.listRef.scrollTo(0, this.listRef.scrollHeight);

  loadMoreMessages = () => {
    this.setState({ isNewMessagesLoading: true });
    const lastElement = document.querySelector('[data-message-id]');
    const id = lastElement.getAttribute('data-message-id');

    api.getMessages({ subscription_id: this.props.details.id, limit: itemsPerPage, offset: this.props.chatIds.list.length }).then(data => {
      this.setState({ isNewMessagesLoading: false });
      this.props.loadMoreMessages({chatId: this.props.details.id, list: data.messages});
      const element = document.querySelector(`[data-message-id="${id}"]`);
      element.scrollIntoView({block: 'start'});
    });
  };

  componentDidMount() {
    const isMessagesLoaded = get(this.props, 'chatIds.isLoaded', false);

    if (this.isHasUnread(this.props.details, this.props.lastMessage)) {
      this.readLastMessage(this.props.details.id, this.props.lastMessage.id);
    }

    if (this.props.details && !isMessagesLoaded) {
      this.loadMessages(this.props);
    }

    if (this.props.details && isMessagesLoaded) {
      this.scrollListMessagesToBottom();
    }
  }

  componentWillReceiveProps(nextProps) {
    const isMessagesLoaded = get(nextProps, 'chatIds.isLoaded', false);
    const isChatChanged = this.props.details && nextProps.details && this.props.details.id !== nextProps.details.id;

    if (isChatChanged && this.isHasUnread(nextProps.details, nextProps.lastMessage)) {
      this.readLastMessage(nextProps.details.id, nextProps.lastMessage.id);
    }

    // если перешли в другой чат - нужно опускать скролл вниз
    // скролл опускается вниз в this.loadMessages, но она не сработает если там уже загружены сообщения
    if (this.props.details && nextProps.details && this.props.details.id !== nextProps.details.id && this.listRef) {
      setTimeout(() => this.scrollListMessagesToBottom());
    }

    // если страница загружается сразу с открытым чатом, details еще не успевает прийти, ловим тут
    if (!this.props.details && nextProps.details && !isMessagesLoaded) {
      this.loadMessages(nextProps);
    }

    // если перешли в другой чат из существующего и в нем не прогружены сообщения
    if (isChatChanged && !isMessagesLoaded) {
      this.loadMessages(nextProps);
    }
  }

  componentWillUnmount() {
    if (this.isHasUnread(this.props.details, this.props.lastMessage)) {
      this.readLastMessage(this.props.details.id, this.props.lastMessage.id);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const isSubscriptionsIdsLoaded = this.props.subscriptions_ids.length === 0 && nextProps.subscriptions_ids.length > 0;
    const isDetailsLoaded = !this.props.details && !!nextProps.details;
    const isChatChanged = this.props.details && nextProps.details && this.props.details.id !== nextProps.details.id;
    const isChatIdsLoaded = !get(this.props, 'chatIds.isLoaded', false) && !!get(nextProps, 'chatIds.isLoaded', false);
    const isMessagesChanged = !isEqual(this.props.messages_list, nextProps.messages_list);
    const isMessageIdChanged = this.props.params.messageId !== nextProps.params.messageId;
    const isTagChanged = this.props.params.tagname !== nextProps.params.tagname;
    const isMessagesHasMoreChanged = this.props.hasMoreMessages !== nextProps.hasMoreMessages;
    const isButtonLoadMoreLoading = this.state.isNewMessagesLoading !== nextState.isNewMessagesLoading;
    const isGalleryChangeState = this.props.isGalleryOpen !== nextProps.isGalleryOpen;

    return isSubscriptionsIdsLoaded ||
      isDetailsLoaded ||
      isChatChanged ||
      isMessagesChanged ||
      isMessageIdChanged ||
      isMessagesHasMoreChanged ||
      isTagChanged ||
      isButtonLoadMoreLoading ||
      isGalleryChangeState ||
      isChatIdsLoaded;
  }

  render() {
    if (this.props.params.messageId) {
      setTimeout(() => {
        const element = document.querySelector(`[data-message-id="${this.props.params.messageId}"]`);

        if (!element) {
          return;
        }

        element.scrollIntoView({block: 'center', behavior: 'smooth'});
        let url;

        if (this.props.params.chatId) {
          url = `/chat/${this.props.params.chatId}`;
        }

        if (this.props.params.userId) {
          url = `/chat/user/${this.props.params.userId}`;
        }

        this.props.replaceUrl(url);
      });
    }

    const groupedMessages = this.getGroupedMessages();
    const isHasMoreMessages = this.props.chatIds && this.props.chatIds.hasMore;
    const isMessagesShown = this.props.details && groupedMessages.length > 0;
    const chatId = this.props.details && this.props.details.id;

    return <div className={cx('messages', this.props.className)}>
      {this.props.details &&
        <Header
          chatId={this.props.details.id}
          className={style.header}
        />
      }

      <div
        id="messages-scroll"
        data-chat-id={chatId}
        className={cx('list', {'_is-gallery-open': this.props.isGalleryOpen})}
        ref={node => this.listRef = node}
      >
        {isHasMoreMessages &&
          <Button
            appearance="_basic-primary"
            text="Load more"
            className={style.load_more}
            onClick={this.loadMoreMessages}
            isLoading={this.state.isNewMessagesLoading}
          />
        }

        {isMessagesShown &&
          groupedMessages.map(grouped => {
            if (grouped.type === 'unreadDelimiter') {
              return <UnreadDelimiter key="unread-delimiter" className={style.item} />;
            }

            if (grouped.type === 'xtagDelimiter') {
              return <XtagDelimiter key={grouped.message_id} id={grouped.message_id} className={style.item} />;
            }

            if (grouped.type === 'dateDelimiter') {
              return <DateDelimiter key={grouped.date} date={grouped.date} className={style.item} />;
            }

            return <MessageItem
              key={grouped.message_uid}
              id={grouped.message_id}
              className={cx('message', 'item')}
              type={grouped.message_type}
            />;
          })
        }

        {!isMessagesShown &&
          <p className={style.empty}>{this.props.t('there_is_no_messages')}</p>
        }
      </div>

      {this.props.details &&
        <Typings className={style.typings} subscription_id={this.props.details.id} />
      }

      {this.props.details && this.props.details.role !== 'ro' &&
        <MessageInput
          subscription_id={this.props.details.id}
          className={style.input}
          scrollListMessagesToBottom={scrollMessagesBottom}
        />
      }
    </div>;
  }
}

export default compose(
  withDetails,
  withRouter,
  withTranslation(),

  connect(
    (state, props) => ({
      currentUser: state.currentUser,
      messages_list: state.messages.list,
      chatIds: props.details ? state.messages.chatIds[props.details.id] : null,
      isGalleryOpen: state.gallery.images.length > 0,
    }),

    {
      loadMessages: messagesActions.loadMessages,
      loadMoreMessages: messagesActions.loadMoreMessages,
    },
  ),

  connect(
    (state, props) => ({
      hasMoreMessages: props.chatIds && props.chatIds.hasMore,
      ...props.chatIds ? { lastMessage: state.messages.list[props.chatIds.list[0]] } : {},
    }),
  ),
)(Messages);