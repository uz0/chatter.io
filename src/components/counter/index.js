import React, { Component } from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';
import forEach from 'lodash/forEach';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

class Counter extends Component {
  getUnreadMessagesCount = () => {
    let count = 0;

    forEach(this.props.subscriptions_list, subscription => {
      const chatMessages = get(this.props.chatIds, `${subscription.id}.list`, []);

      if (!subscription.last_read_message_id) {
        return;
      }

      if (!chatMessages[0]) {
        return;
      }

      if (chatMessages[0] === subscription.last_read_message_id) {
        return;
      }

      const lastReadMessageIndex = chatMessages.indexOf(subscription.last_read_message_id);

      if (lastReadMessageIndex === -1) {
        count += chatMessages.length;
        return;
      }

      count += lastReadMessageIndex;
    });

    return count;
  };

  render() {
    const count = this.getUnreadMessagesCount();

    if (!count) {
      return null;
    }

    return <div className={cx('counter', this.props.className)}>
      {count}
    </div>;
  }
}

export default connect(
  state => ({
    subscriptions_list: state.subscriptions.list,
    chatIds: state.messages.chatIds,
  }),
)(Counter);