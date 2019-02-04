import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import groupBy from 'lodash/groupBy';
import map from 'lodash/map';
import get from 'lodash/get';
import classnames from 'classnames/bind';
import moment from 'moment';
import Header from './header';
import MessageInput from './input';
import DateDelimiter from './date-delimiter';
import XtagDelimiter from './xtag-delimiter';
import UnreadDelimiter from './unread-delimiter';
import MessageItem from '@/components/message-item';
import { api } from '@';
import { getDetails, uid, getChatName } from '@/helpers';
import { actions as messagesActions } from '@/store/messages';
import style from './style.css';

const cx = classnames.bind(style);

const getGroupedMessages = (state, props) => {
  if (!props.details) {
    return null;
  }

  const chatIds = state.messages.chatIds[props.details.id];

  if (!chatIds || !chatIds.isLoaded) {
    return null;
  }

  const groupedByDate = groupBy(
    map(chatIds.list, id => state.messages.list[id]),
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

      messages.push(message.id);
    });

    if (messages.length > 0) {
      array.push({ type: 'messages', messages_ids: messages });
    }
  });

  return array;
};

class Messages extends Component {
  loadMessages = props => api.getMessages({ subscription_id: props.details.id, limit: 100 }).then(data => {
    this.props.loadMessages({chatId: props.details.id, list: data.messages, isLoaded: true});
  });

  componentWillReceiveProps(nextProps) {
    const isMessagesLoaded = get(nextProps, 'chatIds.isLoaded', false);
    const isChatChanged = this.props.details && nextProps.details && this.props.details.id !== nextProps.details.id;

    // details получает не сразу, в componentDidMount details еще undefined
    if (!this.props.details && nextProps.details && !isMessagesLoaded) {
      this.loadMessages(nextProps);
    }

    // если перешли в другой чат из существующего и в нем не прогружены сообщения
    if (isChatChanged && !isMessagesLoaded) {
      this.loadMessages(nextProps);
    }
  }

  shouldComponentUpdate(nextProps) {
    return !!nextProps.details && !!nextProps.chatIds;
  }

  render() {
    const groupedMessages = this.props.groupedMessages || [];

    return <div className={cx('messages', this.props.className)}>
      {this.props.details &&
        <Header
          title={getChatName(this.props.details)}
          count={this.props.details.group.participants.length}
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
              grouped.messages_ids.reverse().map(message_id => <MessageItem
                key={message_id}
                id={message_id}
                className={cx('message', 'item')}
              />)
            }
          </Fragment>)
        }
      </div>

      <MessageInput className={style.input} />
    </div>;
  }
}

export default compose(
  connect(
    (state, props) => ({
      details: getDetails(state.subscriptions.list, props.params),
    }),

    {
      loadMessages: messagesActions.loadMessages,
    },
  ),

  connect(
    (state, props) => ({
      chatIds: props.details ? state.messages.chatIds[props.details.id] : null,
    }),
  ),

  connect(
    (state, props) => ({
      groupedMessages: getGroupedMessages(state, props),
    }),
  ),
)(Messages);
