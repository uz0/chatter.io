import React, { Component } from 'react';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

class Xtag extends Component {
  render() {
    return <p className={cx('xtag', this.props.className)}>
      <span>efim1382</span> has been added
    </p>;
  }
}

export default Xtag;
