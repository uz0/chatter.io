import React from 'react';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

const Avatar = ({ className, letter, photo }) => <div
  className={cx('avatar', className)}
  {...photo ? { style: {'--photo': `url(${photo})`} } : {}}
>
  {letter && letter}
</div>;

export default Avatar;