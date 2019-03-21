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
import DateDelimiter from './date-delimiter';
import XtagDelimiter from './xtag-delimiter';
import UnreadDelimiter from './unread-delimiter';
import Typings from './typings';
import MessageItem from '@/components/message-item';
import Loading from '@/components/loading';
import { withDetails } from '@/hoc';
import { uid } from '@/helpers';
import InfiniteScroll from 'react-infinite-scroller';
import { api } from '@';
import { actions as messagesActions } from '@/store/messages';
import style from './style.css';

const cx = classnames.bind(style);
const itemsPerPage = 50;

class Messages extends Component {
  state = {
    isMessagesLoading: false,
    hasMoreMessages: true,
  };

  getGroupedMessages = () => {
    if (!this.props.details) {
      return [];
    }

    if (!this.props.chatIds || !this.props.chatIds.isLoaded) {
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
    this.setState({ isMessagesLoading: true, hasMoreMessages: true });

    api.getMessages({ subscription_id: props.details.id, limit: itemsPerPage }).then(data => {
      this.props.loadMessages({chatId: props.details.id, list: data.messages, isLoaded: true});
      this.setState({ isMessagesLoading: false });
      this.listRef.scrollTo(0, this.listRef.scrollHeight);
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

  loadMoreMessages = page => {
    api.getMessages({ subscription_id: this.props.details.id, limit: itemsPerPage, offset: itemsPerPage * page }).then(data => {
      if (data.messages.length === 0) {
        this.setState({ hasMoreMessages: false });
      }

      this.props.loadMoreMessages({chatId: this.props.details.id, list: data.messages});
    });
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
      this.readLastMessage();
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const isSubscriptionsIdsLoaded = this.props.subscriptions_ids.length === 0 && nextProps.subscriptions_ids.length > 0;
    const isDetailsLoaded = !this.props.details && !!nextProps.details;
    const isChatChanged = this.props.details && nextProps.details && this.props.details.id !== nextProps.details.id;
    const isChatIdsLoaded = !get(this.props, 'chatIds.isLoaded', false) && !!get(nextProps, 'chatIds.isLoaded', false);
    const isMessagesChanged = !isEqual(this.props.messages_list, nextProps.messages_list);
    const isMessageIdChanged = this.props.params.messageId !== nextProps.params.messageId;
    const isMessagesHasMoreChanged = this.state.hasMoreMessages !== nextState.hasMoreMessages;

    return isSubscriptionsIdsLoaded ||
      isDetailsLoaded ||
      isChatChanged ||
      isMessagesChanged ||
      isMessageIdChanged ||
      isMessagesHasMoreChanged ||
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

    return <div className={cx('messages', this.props.className)}>
      {this.props.details &&
        <Header
          details={this.props.details}
          className={style.header}
        />
      }

      <div className={style.list} ref={node => this.listRef = node}>
        {groupedMessages.length > 0 &&
          <InfiniteScroll
            pageStart={groupedMessages.length <= itemsPerPage ? 0 : groupedMessages.length / itemsPerPage}
            loadMore={this.loadMoreMessages}
            hasMore={this.state.hasMoreMessages}
            useWindow={false}
            isReverse
            initialLoad={false}
            threshold={100}
            loader={<Loading key={0} isShown className={style.list_loading} />}
          >
            {groupedMessages.reverse().map((grouped, index) => {
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
          </InfiniteScroll>
        }

        {groupedMessages.length === 0 &&
          <p className={style.empty}>{this.props.t('there_is_no_messages')}</p>
        }

        <Loading isShown={!isMessagesLoaded} className={style.loading} />
      </div>

      {this.props.details &&
        <Typings subscription_id={this.props.details.id} />
      }

      {this.props.details &&
        <MessageInput subscription_id={this.props.details.id} className={style.input} />
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
    }),

    {
      loadMessages: messagesActions.loadMessages,
      loadMoreMessages: messagesActions.loadMoreMessages,
    },
  ),

  connect(
    (state, props) => ({
      ...props.chatIds ? { lastMessage: state.messages.list[props.chatIds.list[0]] } : {},
    }),
  ),
)(Messages);