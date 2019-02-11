import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import get from 'lodash/get';
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
import MessageItem from '@/components/message-item';
import Loading from '@/components/loading';
import { withDetails, withTypings } from '@/hoc';
import { api } from '@';
import { uid } from '@/helpers';
import { actions as messagesActions } from '@/store/messages';
import style from './style.css';

const cx = classnames.bind(style);

class Messages extends Component {
  state = {
    isMessagesLoading: false,
  };

  getGroupedMessages = () => {
    if (!this.props.details) {
      return null;
    }

    if (!this.props.chatIds || !this.props.chatIds.isLoaded) {
      return null;
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

        if (this.props.details.last_read_message_id === message.id && this.props.lastMessage && this.props.lastMessage.id !== message.id) {
          messages.push('unreadDelimiter');
        }
      });

      if (messages.length > 0) {
        array.push({ type: 'messages', messages_ids: messages });
      }
    });

    return array;
  };

  loadMessages = props => {
    this.setState({ isMessagesLoading: true });

    api.getMessages({ subscription_id: props.details.id, limit: 100 }).then(data => {
      this.setState({ isMessagesLoading: false });
      this.props.loadMessages({chatId: props.details.id, list: data.messages, isLoaded: true});
    });
  }

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

  shouldComponentUpdate(nextProps) {
    const isSubscriptionsIdsLoaded = this.props.subscriptions_ids.length === 0 && nextProps.subscriptions_ids.length > 0;
    const isDetailsLoaded = !this.props.details && !!nextProps.details;
    const isChatIdsLoaded = !get(this.props, 'chatIds.isLoaded', false) && !!get(nextProps, 'chatIds.isLoaded', false);
    const isDetailsChanged = !isEqual(this.props.details, nextProps.details);
    const isTypingsChanged = this.props.typings !== nextProps.typings;
    const isMessagesChanged = !isEqual(this.props.messages_list, nextProps.messages_list);

    return isSubscriptionsIdsLoaded ||
      isDetailsLoaded ||
      isChatIdsLoaded ||
      isDetailsChanged ||
      isTypingsChanged ||
      isMessagesChanged;
  }

  render() {
    const groupedMessages = this.getGroupedMessages() || [];
    const isMessagesLoaded = get(this.props, 'chatIds.isLoaded', false);

    return <div className={cx('messages', this.props.className)}>
      {this.props.details &&
        <Header
          details={this.props.details}
          className={style.header}
        />
      }

      <div className={style.list}>
        {groupedMessages &&
          groupedMessages.reverse().map(grouped => <Fragment key={uid()}>
            {grouped.type === 'unreadDelimiter' &&
              <UnreadDelimiter className={cx('item')} />
            }

            {grouped.type === 'xtagDelimiter' &&
              <XtagDelimiter id={grouped.message_id} className={cx('item')} />
            }

            {grouped.type === 'dateDelimiter' &&
              <DateDelimiter date={grouped.date} className={cx('item')} />
            }

            {grouped.type === 'messages' &&
              grouped.messages_ids.reverse().map(message_id => <Fragment
                key={message_id}
              >
                {message_id === 'unreadDelimiter' &&
                  <UnreadDelimiter className={cx('item')} />
                }

                {message_id !== 'unreadDelimiter' &&
                  <MessageItem
                    key={message_id}
                    id={message_id}
                    className={cx('message', 'item')}
                  />
                }
              </Fragment>)
            }
          </Fragment>)
        }

        {groupedMessages.length === 0 &&
          <p className={style.empty}>{this.props.t('there_is_no_messages')}</p>
        }

        <Loading isShown={!isMessagesLoaded} className={style.loading} />
      </div>

      {this.props.typings &&
        <p className={style.typings}>{this.props.typings}</p>
      }

      {this.props.details &&
        <MessageInput subscription_id={this.props.details.id} className={style.input} />
      }
    </div>;
  }
}

export default compose(
  withDetails,
  withNamespaces('translation'),

  connect(
    (state, props) => ({
      messages_list: state.messages.list,
      chatIds: props.details ? state.messages.chatIds[props.details.id] : null,
    }),

    {
      loadMessages: messagesActions.loadMessages,
    },
  ),

  connect(
    (state, props) => ({
      ...props.chatIds ? { lastMessage: state.messages.list[props.chatIds.list[0]] } : {},
    }),
  ),

  withTypings(props => ({
    chat: props.details,
  })),
)(Messages);
