import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import get from 'lodash/get';
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
import { withDetails } from '@/hoc';
import { api } from '@';
import { uid, getChatName } from '@/helpers';
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

        messages.push(message.id);
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

  // shouldComponentUpdate(nextProps) {
  //   console.log(this.props);
  //   console.log(nextProps);
  //   return true;
  // }

  render() {
    // console.log(123);
    const groupedMessages = this.getGroupedMessages() || [];

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

        {groupedMessages.length === 0 &&
          <p className={style.empty}>{this.props.t('there_is_no_messages')}</p>
        }

        <Loading isShown={this.state.isMessagesLoading} className={style.loading} />
      </div>

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
    state => ({
      messages_list: state.messages.list,
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
)(Messages);
