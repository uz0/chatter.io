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
  const isActionsExist = actions.length > 0;

  return <div className={cx('modal', wrapClassName)}>
    <div className={style.header}>
      {
        /*
          Заголовок должен быть по центру, но кнопки будут всегда разной ширины.
          Надо их продублировать их слева, что б отцентрировать заголовок
        */
      }

      {isActionsExist &&
        <div className={style.hidden_actions}>
          {actions.map(action => <Button key={action.text} {...action} />)}
        </div>
      }

      <div className={style.section}>
        <p className={style.title}>{title}</p>

        {subcaption &&
          <p className={style.subcaption}>{subcaption}</p>
        }
      </div>

      {isActionsExist &&
        actions.map(action => <Button key={action.text} {...action} className={style.action} />)
      }

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
  </div>;
};

export default Modal;
