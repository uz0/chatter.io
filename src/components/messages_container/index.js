import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import get from 'lodash/get';
import find from 'lodash/find';
import isEqual from 'lodash/isEqual';
import reject from 'lodash/reject';
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

    return array;
  };

  loadMessages = props => {
    this.setState({ isMessagesLoading: true });

    api.getMessages({ subscription_id: props.details.id, limit: 100 }).then(data => {
      this.setState({ isMessagesLoading: false });
      this.props.loadMessages({chatId: props.details.id, list: data.messages, isLoaded: true});
    });
  }

  getMessageType = (initialGroup, index) => {
    let group = [...initialGroup];
    const last_message_id = group[index + 1];
    const message_id = group[index];
    const next_message_id = group[index - 1];

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

  isReaded = message_id => {
    const participants = reject(this.props.details.group.participants, { user_id: this.props.currentUser.id });

    if (!participants) {
      return false;
    }

    let maxReadedMessageId = 0;

    participants.forEach(participant => {
      if (participant.last_read_message_id > maxReadedMessageId) {
        maxReadedMessageId = participant.last_read_message_id;
      }
    });

    if (maxReadedMessageId >= message_id) {
      return true;
    }

    return false;
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

  isParticipantsReadedChanged = nextProps => {
    if (!this.props.details || !nextProps.details) {
      return false;
    }

    const participants = reject(this.props.details.group.participants, { user_id: this.props.currentUser.id });
    const nextPropsParticipants = reject(nextProps.details.group.participants, { user_id: this.props.currentUser.id });

    if (!participants || !nextPropsParticipants) {
      return false;
    }

    if (participants.length !== nextPropsParticipants.length) {
      return false;
    }

    let isReadedChanged = false;

    participants.forEach(participant => {
      const nextPropsParticipant = find(nextPropsParticipants, { user_id: participant.user_id });

      if (!nextPropsParticipant) {
        return false;
      }

      if (participant.last_read_message_id !== nextPropsParticipant.last_read_message_id) {
        isReadedChanged = true;
      }
    });

    return isReadedChanged;
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

  shouldComponentUpdate(nextProps) {
    const isSubscriptionsIdsLoaded = this.props.subscriptions_ids.length === 0 && nextProps.subscriptions_ids.length > 0;
    const isDetailsLoaded = !this.props.details && !!nextProps.details;
    const isChatChanged = this.props.details && nextProps.details && this.props.details.id !== nextProps.details.id;
    const isChatIdsLoaded = !get(this.props, 'chatIds.isLoaded', false) && !!get(nextProps, 'chatIds.isLoaded', false);
    const isMessagesChanged = !isEqual(this.props.messages_list, nextProps.messages_list);
    const isParticipantsReadedChanged = this.isParticipantsReadedChanged(nextProps);

    return isSubscriptionsIdsLoaded ||
      isDetailsLoaded ||
      isChatChanged ||
      isChatIdsLoaded ||
      isParticipantsReadedChanged ||
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
              grouped.messages_ids.reverse().map((message_id, index) => {
                const type = this.getMessageType(grouped.messages_ids, index);
                const isReaded = message_id !== 'unreadDelimiter' ? this.isReaded(message_id) : false;

                return <Fragment key={message_id}>
                  {message_id === 'unreadDelimiter' &&
                    <UnreadDelimiter className={cx('item')} />
                  }

                  {message_id !== 'unreadDelimiter' &&
                    <MessageItem
                      key={message_id}
                      id={message_id}
                      className={cx('message', 'item')}
                      type={type}
                      {...isReaded ? { isReaded: true } : {}}
                    />
                  }
                </Fragment>;
              })
            }
          </Fragment>)
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
  withNamespaces('translation'),

  connect(
    (state, props) => ({
      currentUser: state.currentUser,
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
)(Messages);
