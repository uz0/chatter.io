import React, { Component } from 'react';
import classnames from 'classnames/bind';
import Header from './header';
import MessageInput from './input';
import DateDelimiter from './date-delimiter';
import XtagDelimiter from './xtag-delimiter';
import UnreadDelimiter from './unread-delimiter';
import MessageItem from '@/components/message-item';
import style from './style.css';

const cx = classnames.bind(style);

class Messages extends Component {
  render() {
    return <div className={cx('messages', this.props.className)}>
      <Header className={style.header} />

      <div className={style.list}>
        <MessageItem className={cx('message', 'item')} />
        <UnreadDelimiter className={cx('item')} />
        <MessageItem className={cx('message', 'item')} />
        <XtagDelimiter className={cx('item')} />
        <MessageItem className={cx('message', 'item')} />
        <DateDelimiter className={cx('item')} />
        <MessageItem className={cx('message', 'item')} />
      </div>

      <MessageInput className={style.input} />
    </div>;
  }
}

export default Messages;
