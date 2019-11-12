import React from 'react';
import classnames from 'classnames/bind';
import Loading from '@/components/loading';
import style from './style.css';

const cx = classnames.bind(style);

const Section = ({ items, isLoading, action, title, emptyMessage, renderItem, className }) => {
  const isItemsExist = items && items.length > 0;
  const isEmptyMessageShown = !isItemsExist && emptyMessage;

  return <div className={cx('section', className)}>
    {title &&
      <div className={style.title}>
        <p className={style.name}>{title}</p>

        {isLoading &&
          <Loading isShown className={style.loading} />
        }

        {action &&
          <button className={style.action} onClick={action.onClick}>{action.text}</button>
        }
      </div>

    }

    {isItemsExist &&
      items.map(item => renderItem({ item }))
    }

    {isEmptyMessageShown &&
      emptyMessage()
    }
  </div>;
};

export default Section;
