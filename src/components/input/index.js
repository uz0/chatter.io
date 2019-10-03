import React from 'react';
import Icon from '@/components/icon';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

const Input = ({
  appearance = '_none-transparent',
  type = 'text',
  icon,
  title,
  onChange,
  onBlur,
  onInput,
  value,
  placeholder,
  disabled,
  error,
  className,
}) => <div className={cx('container', className)} appearance={appearance}>
  {title &&
    <p className={style.title}>{title}</p>
  }

  <div className={style.section}>
    {icon &&
      <Icon name={icon} />
    }

    <input
      type={type}
      className={style.input}
      onChange={onChange}
      onBlur={onBlur}
      onInput={onInput}
      value={value}
      placeholder={placeholder}
      {...disabled ? { disabled: true } : {}}
    />
  </div>

  {error &&
    <p className={style.error}>{error}</p>
  }
</div>;

export default Input;
