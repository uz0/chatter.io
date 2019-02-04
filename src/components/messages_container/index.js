import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import get from 'lodash/get';
import classnames from 'classnames/bind';
import { withNamespaces } from 'react-i18next';
import Header from './header';
import MessageInput from './input';
import DateDelimiter from './date-delimiter';
import XtagDelimiter from './xtag-delimiter';
import UnreadDelimiter from './unread-delimiter';
import MessageItem from '@/components/message-item';
import Loading from '@/components/loading';
import { api } from '@';
import { getDetails, uid, getChatName, getGroupedMessages } from '@/helpers';
import { actions as messagesActions } from '@/store/messages';
import style from './style.css';

const cx = classnames.bind(style);

class Messages extends Component {
  state = {
    isMessagesLoading: false,
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

  // message-item обновляется много раз
  // shouldComponentUpdate(nextProps) {
  // }

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
  withNamespaces('translation'),

  connect(
    (state, props) => ({
      details: getDetails(state.subscriptions.list, props.params),
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

  connect(
    (state, props) => ({
      groupedMessages: getGroupedMessages(state, props),
    }),
  ),
)(Messages);
