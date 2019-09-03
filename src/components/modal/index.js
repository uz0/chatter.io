import React from 'react';
import classnames from 'classnames/bind';
import Button from '@/components/button';
import style from './style.css';

const cx = classnames.bind(style);

const Modal = ({
  title,
  subcaption,
  close,
  actions,
  children,
  wrapClassName,
  className,
}) => {
  const isActionsExist = actions && actions.length > 0;

  return <div className={cx('modal', wrapClassName)}>
    <div className={style.header}>
      <div className={style.section}>
        <p className={style.title}>{title}</p>

        {subcaption &&
          <p className={style.subcaption}>{subcaption}</p>
        }
      </div>

      <Button
        appearance="_fab-divider"
        icon="close"
        onClick={close}
        className={style.close}
      />
    </div>

    <div className={cx('content', className)}>
      {children}
    </div>

    {isActionsExist &&
      <div className={style.footer}>
        {actions.map(action => <Button key={action.text} {...action} className={style.action} />)}
      </div>
    }
  </div>;
};

export default Modal;
