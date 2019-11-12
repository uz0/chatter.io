import React from 'react';
import classnames from 'classnames/bind';
import Icon from '@/components/icon';
import Loading from '@/components/loading';
import style from './style.css';

const cx = classnames.bind(style);

const Button = ({
  ref,
  type = 'button',
  icon,
  text,
  isLoading,
  className,
  appearance,
  disabled,
  onClick,
}) => <button
  type={type}
  ref={ref}
  className={cx('button', className)}
  appearance={appearance}
  onClick={onClick}
  {...disabled ? { disabled: true } : {}}
>
  {icon && <Icon name={icon} />}
  {text && <span>{text}</span>}

  {isLoading &&
    <Loading isShown className={style.loading} />
  }
</button>;

export default Button;
