import React from 'react';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

const FakeCheckbox = ({
  disabled,
  value,
  label,
  className,
  onChange,
}) => <label className={cx('container', className)}>
  <input
    type="checkbox"
    onChange={onChange}
    {...value ? { checked: true } : {}}
    {...disabled ? { disabled: true } : {}}
  />

  <div className={cx('switch', {'_is-checked': value})}>
    <span className={style.title}>{label}</span>
    <div className={style.circle} />
  </div>
</label>;

export default FakeCheckbox;
