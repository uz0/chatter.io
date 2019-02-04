import React from 'react';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

const Loading = ({ className, isShown }) => <div
  className={cx(className, 'loading', { '_is-shown': isShown })}
/>;

export default Loading;
