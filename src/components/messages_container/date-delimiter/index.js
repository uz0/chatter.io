import React, { Component } from 'react';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

class DateDelimiter extends Component {
  render() {
    return <p className={cx('date', this.props.className)}>Today</p>;
  }
}

export default DateDelimiter;
