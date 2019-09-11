import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import Button from '@/components/button';
import classnames from 'classnames/bind';
import { actions as inputActions } from '@/components/messages_container/input';
import style from './style.css';

const cx = classnames.bind(style);

class ReplyInput extends Component {
  state = {
    value: '',
  };

  onInput = event => this.setState({ value: event.target.value });
  onChange = () => {};

  send = () => {
    if (!this.state.value) {
      return;
    }

    this.props.sendMessage({
      text: this.state.value,
      reply_message_id: this.props.messageId,
      subscription_id: this.props.subscriptionId,
    });

    this.setState({ value: '' });
  };

  render() {
    return <div className={cx('reply', this.props.className)}>
      <input
        placeholder="Reply"
        value={this.state.value}
        onInput={this.onInput}
        onChange={this.onChange}
        className={style.input}
      />

      <Button
        appearance="_icon-transparent"
        icon="plus"
        onClick={this.send}
        className={style.action}
      />
    </div>;
  }
}

export default compose(
  connect(
    null,

    {
      sendMessage: inputActions.sendMessage,
    },
  ),
)(ReplyInput);
