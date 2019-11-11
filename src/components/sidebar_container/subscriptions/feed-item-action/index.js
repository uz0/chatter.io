import React from 'react';
import classnames from 'classnames/bind';
import Icon from '@/components/icon';
import style from './style.css';

const cx = classnames.bind(style);

const FeedItemAction = ({ className, icon, text, isActive, onClick }) => {
  if (onClick) {
    return <button className={cx('feed-item-action', className)} onClick={onClick}>
      {icon && <Icon name={icon} />}
      <p className={style.caption}>{text}</p>
    </button>;
  }

  return <div className={cx('feed-item-action', { 'feed-item-action-active': isActive }, className)}>
    {icon && <Icon name={icon} />}

    <p className={style.caption}>{text}</p>
  </div>;
};

export default FeedItemAction;
