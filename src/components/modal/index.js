import React from 'react';
import Button from '@/components/button';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

const modalClick = event => event.stopPropagation();

const Modal = ({
  actions,
  children,
  wrapClassName,
  className,
  close,
}) => <div className={style.wrapper} onClick={close}>
  <div className={cx('modal', wrapClassName)} onClick={modalClick}>
    <div className={cx('content', className)}>
      {children}
    </div>

    {actions &&
      <div className={style.footer}>
        {actions.map(action => <Button key={action.text} className={style.button} {...action} />)}
      </div>
    }
  </div>
</div>;

export default Modal;