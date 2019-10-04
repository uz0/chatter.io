import React from 'react';
import classnames from 'classnames/bind';
import Button from '@/components/button';
import OrganizationIcon from '@/components/organization-icon';
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
  orgIcon,
}) => {
  const isActionsExist = actions && actions.length > 0;

  return <div className={cx('modal', wrapClassName)}>
    <div className={style.header}>
      <div className={style.section}>
        <div className={style.title_wrapper}>
          {orgIcon &&
            <OrganizationIcon {...orgIcon} className={style.icon} />
          }

          <p className={style.title}>{title}</p>
        </div>

        {subcaption &&
          <p className={style.subcaption}>{subcaption}</p>
        }
      </div>

      <Button
        type="button"
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
        {actions.map(action => <Button key={action.text} type="button" {...action} className={style.action} />)}
      </div>
    }
  </div>;
};

export default Modal;
