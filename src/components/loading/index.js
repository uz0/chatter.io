import React from 'react';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

const Loading = ({ className, isShown, type = 'ring' }) => <div
  className={cx(className, 'loading', type, { '_is-shown': isShown })}
/>;

export default Loading;
