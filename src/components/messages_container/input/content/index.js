import React, { Component } from 'react';
import classnames from 'classnames/bind';
import Message from './message';
import Textarea from './textarea';
import Attachments from './attachments';
import Todo from './todo';
import style from './style.css';

const cx = classnames.bind(style);

class Content extends Component {
  render() {
    return <div className={cx('content', this.props.className)}>
      <Message />
      <Textarea subscription_id={this.props.subscription_id} />
      <Attachments />
      <Todo />
    </div>;
  }
}

export default Content;
