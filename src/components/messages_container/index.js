import React, { Component } from 'react';
import compose from 'recompose/compose';
import classnames from 'classnames/bind';
import Header from './header';
import MessageInput from './input';
import List from './list';
import Typings from './typings';
import { withDetails } from '@/hoc';
import style from './style.css';

const cx = classnames.bind(style);

class Messages extends Component {
  shouldComponentUpdate(nextProps) {
    const isChatChanged = this.props.details.id !== nextProps.details.id;
    const isChatNameChanged = this.props.details.group.name !== nextProps.details.group.name;

    return isChatChanged || isChatNameChanged;
  }

  render() {
    return <div className={cx('messages', this.props.className)}>
      <Header
        chatId={this.props.details.id}
        className={style.header}
      />

      <List
        details_id={this.props.details.id}
        className={style.list}
      />

      <Typings
        subscription_id={this.props.details.id}
        className={style.typings}
      />

      {this.props.details.role !== 'ro' &&
        <MessageInput
          subscription_id={this.props.details.id}
          className={style.input}
        />
      }
    </div>;
  }
}

export default compose(
  withDetails,
)(Messages);