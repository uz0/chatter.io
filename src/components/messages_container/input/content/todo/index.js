import React from 'react';
import Icon from '@/components/icon';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

const Todo = ({ className }) => {
  const isTodoExist = false;

  if (!isTodoExist) {
    return null;
  }

  return <div className={cx('todo', className)}>
    <button className={style.item}>
      <div className={style.circle}>
        <Icon name="mark" />
      </div>

      <p className={style.title}>Fix header on iPhone X</p>

      <button className={style.delete}>
        <Icon name="close" />
      </button>
    </button>

    <button className={style.item}>
      <div className={style.circle}>
        <Icon name="mark" />
      </div>

      <p className={style.title}>Fix header on iPhone X</p>

      <button className={style.delete}>
        <Icon name="close" />
      </button>
    </button>
  </div>;
};

export default Todo;
