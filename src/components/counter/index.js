import React from 'react';
import classnames from 'classnames';
import style from './style.css';

const cx = classnames.bind(style);

const Counter = ({ value, className }) => (
  <div className={cx(style.counter, className)}>
    {value}
  </div>
);

export default Counter;
