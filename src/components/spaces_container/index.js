import React from 'react';
import compose from 'recompose/compose';
import classnames from 'classnames/bind';
import Input from './input';
import List from './list';
import { withDetails } from '@/hoc';
import style from './style.css';

const cx = classnames.bind(style);

const Spaces = ({ details, className }) => <div className={cx('spaces', className)}>
  <h3 className={style.title}>#{details.group.name}</h3>
  <p className={style.subtitle}>Public space</p>

  <Input details_id={details.id} className={style.input_container} />
  <List details_id={details.id} />
</div>;

export default compose(
  withDetails,
)(Spaces);
