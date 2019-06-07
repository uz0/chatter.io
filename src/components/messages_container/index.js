import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import get from 'lodash/get';
import { withRouter } from 'react-router';
import isEqual from 'lodash/isEqual';
import map from 'lodash/map';
import groupBy from 'lodash/groupBy';
import moment from 'moment';
import classnames from 'classnames/bind';
import { withNamespaces } from 'react-i18next';
import Header from './header';
import MessageInput from './input';
import Button from '@/components/button';
import DateDelimiter from './date-delimiter';
import XtagDelimiter from './xtag-delimiter';
import UnreadDelimiter from './unread-delimiter';
import Typings from './typings';
import MessageItem from '@/components/message-item';
import Loading from '@/components/loading';
import { withDetails } from '@/hoc';
import { uid } from '@/helpers';
import { api } from '@';
import { actions as messagesActions } from '@/store/messages';
import style from './style.css';

const cx = classnames.bind(style);
const itemsPerPage = 50;

class Messages extends Component {
  state = {
    isMessagesLoading: false,
    isNewMessagesLoading: false,
  };

  // need refactoring
  getGroupedMessages = () => {
    if (!this.props.details) {
      return [];
    }

    if (!this.props.chatIds) {
      return [];
    }

    const groupedByDate = groupBy(
      map(this.props.chatIds.list, id => this.props.messages_list[id]),
      message => moment(message.created_at).format('YYYY-MM-DD'),
    );

    let array = [];
    const dates = Object.keys(groupedByDate).sort();

    dates.forEach(key => {
      array.push({ type: 'dateDelimiter', date: key });

      let messages = [];

      groupedByDate[key].reverse().forEach(message => {
        if (message.xtag) {
          if (messages.length > 0) {
            array.push({ type: 'messages', messages_ids: messages });
          }

          array.push({ type: 'xtagDelimiter', message_id: message.id });
          messages = [];
          return;
        }

        messages.push(message.id || message.uid);

        if (this.props.details.last_read_message_id === message.id &&
          this.props.lastMessage &&
          this.props.lastMessage.id !== message.id &&
          message.user_id !== this.props.currentUser.id
        ) {
          messages.push('unreadDelimiter');
        }
      });

      if (messages.length > 0) {
        array.push({ type: 'messages', messages_ids: messages });
      }
    });

    let formatted = [];

    array.reverse().forEach(item => {
      if (item.type !== 'messages') {
        formatted.push(item);
        return;
      }

      if (item.type === 'messages') {
        item.messages_ids.reverse().forEach(id => {
          formatted.push({ type: 'message', message_id: id });
        });
      }
    });

    return formatted;
  };

  loadMessages = props => {
    this.setState({ isMessagesLoading: true });

    api.getMessages({ subscription_id: props.details.id, limit: itemsPerPage }).then(data => {
      this.props.loadMessages({chatId: props.details.id, list: data.messages, isLoaded: true});
      this.setState({ isMessagesLoading: false });
      this.scrollListMessagesToBottom();
    });
  }

  getMessageType = (groupedMessages, index) => {
    if (groupedMessages[index].type !== 'message') {
      return;
    }

    const last_message_id = groupedMessages[index - 1] && groupedMessages[index - 1].type === 'message' ? groupedMessages[index - 1].message_id : null;
    const message_id = groupedMessages[index].message_id;
    const next_message_id = groupedMessages[index + 1] && groupedMessages[index + 1].type === 'message' ? groupedMessages[index + 1].message_id : null;

    if (message_id === 'unreadDelimiter') {
      return;
    }

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

  readLastMessage = () => {
    if (!this.props.lastMessage) {
      return;
    }

    if (this.props.details.last_read_message_id === this.props.lastMessage.id) {
      return;
    }

    api.updateSubscription({
      subscription_id: this.props.details.id,
      last_read_message_id: this.props.lastMessage.id,
    });
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
      this.readLastMessage();
    }
  }

  componentWillUnmount() {
    this.readLastMessage();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const isSubscriptionsIdsLoaded = this.props.subscriptions_ids.length === 0 && nextProps.subscriptions_ids.length > 0;
    const isDetailsLoaded = !this.props.details && !!nextProps.details;
    const isChatChanged = this.props.details && nextProps.details && this.props.details.id !== nextProps.details.id;
    const isChatIdsLoaded = !get(this.props, 'chatIds.isLoaded', false) && !!get(nextProps, 'chatIds.isLoaded', false);
    const isMessagesChanged = !isEqual(this.props.messages_list, nextProps.messages_list);
    const isMessageIdChanged = this.props.params.messageId !== nextProps.params.messageId;
    const isMessagesHasMoreChanged = this.props.hasMoreMessages !== nextProps.hasMoreMessages;
    const isButtonLoadMoreLoading = this.state.isNewMessagesLoading !== nextState.isNewMessagesLoading;
    const isGalleryChangeState = this.props.isGalleryOpen !== nextProps.isGalleryOpen;

    return isSubscriptionsIdsLoaded ||
      isDetailsLoaded ||
      isChatChanged ||
      isMessagesChanged ||
      isMessageIdChanged ||
      isMessagesHasMoreChanged ||
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

        this.props.router.replace(url);
      });
    }

    const groupedMessages = this.getGroupedMessages() || [];
    const isMessagesLoaded = get(this.props, 'chatIds.isLoaded', false);
    const isHasMoreMessages = this.props.chatIds && this.props.chatIds.hasMore;

    return <div className={cx('messages', this.props.className)}>
      {this.props.details &&
        <Header
          chatId={this.props.details.id}
          className={style.header}
        />
      }

      <div className={cx('list', {'_is-gallery-open': this.props.isGalleryOpen})} ref={node => this.listRef = node} id="messages-scroll">
        {isHasMoreMessages &&
          <Button
            appearance="_basic-primary"
            text="Load more"
            className={style.load_more}
            onClick={this.loadMoreMessages}
            isLoading={this.state.isNewMessagesLoading}
          />
        }

        {groupedMessages.length > 0 && groupedMessages.reverse().map((grouped, index) => {
          const type = this.getMessageType(groupedMessages, index);

          return <Fragment key={uid()}>
            {grouped.type === 'unreadDelimiter' &&
              <UnreadDelimiter className={cx('item')} />
            }

            {grouped.type === 'xtagDelimiter' &&
              <XtagDelimiter id={grouped.message_id} className={cx('item')} />
            }

            {grouped.type === 'dateDelimiter' &&
              <DateDelimiter date={grouped.date} className={cx('item')} />
            }

            {grouped.type === 'message' && grouped.message_id === 'unreadDelimiter' &&
              <UnreadDelimiter className={cx('item')} />
            }

            {grouped.type === 'message' && grouped.message_id !== 'unreadDelimiter' &&
              <MessageItem
                key={grouped.message_id}
                id={grouped.message_id}
                className={cx('message', 'item')}
                type={type}
              />
            }
          </Fragment>;
        })}

        {groupedMessages.length === 0 &&
          <p className={style.empty}>{this.props.t('there_is_no_messages')}</p>
        }

        <Loading isShown={!isMessagesLoaded} className={style.loading} />
      </div>

      {this.props.details &&
        <Typings className={style.typings} subscription_id={this.props.details.id} />
      }

      {this.props.details && this.props.details.role !== 'ro' &&
        <MessageInput
          subscription_id={this.props.details.id}
          className={style.input}
          scrollListMessagesToBottom={this.scrollListMessagesToBottom}
        />
      }
    </div>;
  }
}

export default compose(
  withDetails,
  withRouter,
  withNamespaces('translation'),

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