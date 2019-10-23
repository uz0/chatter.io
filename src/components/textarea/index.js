import React from 'react';
import Icon from '@/components/icon';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

const Textarea = ({
  appearance = '_none-transparent',
  id,
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

    <textarea
      id={id}
      className={style.textarea}
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

export default Textarea;
