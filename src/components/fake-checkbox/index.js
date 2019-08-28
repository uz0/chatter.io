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
}) => <div className={cx('container', className)}>
  <label className={style.checkbox_wrapper}>
    <input
      type="checkbox"
      onChange={onChange}
      {...value ? { checked: true } : {}}
      {...disabled ? { disabled: true } : {}}
    />

    <div className={cx('switch', {'_is-checked': value})}>
      <div className={style.circle} />
    </div>
  </label>

  <p className={style.label}>{label}</p>
</div>;

export default FakeCheckbox;
