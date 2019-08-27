import React, { Component } from 'react';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

class UnreadDelimiter extends Component {
  render() {
    return <div className={cx('unread', this.props.className)}>
      <span>Unread</span>
    </div>;
  }
}

export default UnreadDelimiter;
