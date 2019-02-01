import React, { Component } from 'react';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

class Header extends Component {
  render() {
    return <div className={cx('header', this.props.className)}>
      <button>Revolution Product</button>
      <p className={style.count}>12 people</p>
    </div>;
  }
}

export default Header;
