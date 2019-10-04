import React from 'react';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

const Avatar = ({ className, letter, photo }) => {
  let inline = {};

  if (photo) {
    inline['--photo'] = `url(${photo})`;
  }

  return <div
    className={cx('avatar', className)}
    style={inline}
  >
    {letter && letter}
  </div>;
};

export default Avatar;
