import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import get from 'lodash/get';
import map from 'lodash/map';
import sortBy from 'lodash/sortBy';
import filter from 'lodash/filter';
import moment from 'moment';
import Item from './item';
import style from './style.css';

class Replies extends Component {
  getGroupedMessages = () => {
    let messages = map(this.props.messages, id => this.props.messages_list[id]);
    messages = filter(messages, message => message.in_reply_to_message_id === this.props.messageId);
    messages = sortBy(messages, message => moment(message.created_at));

    return messages;
  };

  render() {
    const messages = this.getGroupedMessages();

    if (messages.length === 0) {
      return null;
    }

    return <div className={style.replies}>
      {messages.map(message => <Item key={message.uid} uid={message.uid} />)}
    </div>;
  }
}

export default compose(
  connect(
    (state, props) => ({
      messages: get(state.messages, `chatIds.${props.subscriptionId}.list`, []),
      messages_list: state.messages.list,
    }),
  ),
)(Replies);
