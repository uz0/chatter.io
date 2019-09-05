import React from 'react';
import Link from '@/components/link';
import Icon from '@/components/icon';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

const SidebarPanel = ({ className }) => {
  return <div className={cx('panel', className)}>
    <Link to="/chat" className={style.button} />

    <div className={style.divider} />

    <button className={style.button}>
      <img src="/assets/default-image.jpg" />
    </button>

    <button className={style.button}>
      <img src="/assets/default-image.jpg" />
    </button>

    <Link to="/new-company" className={style.new}>
      <Icon name="plus" />
    </Link>
  </div>;
};

export default SidebarPanel;
