import React from 'react';
import Icon from '@/components/icon';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

const FakeSelect = ({
  label,
  value,
  action,
  values,
  className,
  placeholder,
}) => <div className={cx('container', className)}>
  {label && <label className={style.label}>{label}</label>}

  <Icon name="arrow-down" className={style.icon} />

  <select
    placeholder={placeholder}
    className={cx('select', className)}
    value={value}
    defaultValue={placeholder}
    onChange={event => action(event.target.value)}
  >
    <option
      hidden
      disabled
    >
      {placeholder}
    </option>

    {values && values.map(item => <option
      key={item.name}
      value={item.value}
    >
      {item.name}
    </option>)
    }
  </select>
</div>;

export default FakeSelect;