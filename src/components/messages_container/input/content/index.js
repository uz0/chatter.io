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
      <Message className={style.message} />
      <Textarea subscription_id={this.props.subscription_id} className={style.textarea} />
      <Attachments className={style.attachments} />
      <Todo className={style.todo} />
    </div>;
  }
}

export default Content;
