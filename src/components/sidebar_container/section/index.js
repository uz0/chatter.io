import React from 'react';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

const Section = ({ items, title, emptyMessage, renderItem, className }) => {
  const isItemsExist = items && items.length > 0;

  return <div className={cx('section', className)}>
    {title &&
      <p className={style.title}>{title}</p>
    }

    {isItemsExist &&
      items.map(item => renderItem({ item }))
    }

    {!isItemsExist &&
      <p className={style.empty}>{emptyMessage}</p>
    }
  </div>;
};

export default Section;