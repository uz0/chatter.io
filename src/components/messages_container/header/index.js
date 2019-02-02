import React, { Component } from 'react';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

class Header extends Component {
  render() {
    return <div className={cx('header', this.props.className)}>
      <button>{this.props.title}</button>
      <p className={style.count}>{this.props.count} people</p>
    </div>;
  }
}

export default Header;
