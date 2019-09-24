import React from 'react';
import Link from '@/components/link';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

const Button = props => <button {...props}>{props.children}</button>;

const wrappers = {
  link: Link,
  button: Button,
};

const Navigation = ({ actions, className }) => {
  return <div className={cx('navigation', className)}>
    {actions.map(action => {
      const Wrapper = action.to ? wrappers['link'] : wrappers['button'];

      return <Wrapper
        key={action.text}
        {...action.to ? {to: action.to} : {}}
        {...action.to ? {activeClassName: '_is-active'} : {}}
        className={style.item}
      >{action.text}</Wrapper>;
    })}
  </div>;
};

export default Navigation;
