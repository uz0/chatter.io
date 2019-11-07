import React from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import get from 'lodash/get';
import Icon from '@/components/icon';
import SubscriptionAvatar from '@/components/subscription-avatar';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

const wrappers = {
  div: ({children, ...props}) => <div {...props}>{children}</div>,
  button: ({children, ...props}) => <button {...props}>{children}</button>,
};

const Task = ({
  title,
  done,
  executor_id,
  className,
  onClick,
}) => {
  const Wrapper = wrappers[onClick ? 'button' : 'div'];

  return <Wrapper className={cx('task', className)} onClick={onClick}>
    <div className={cx('circle', {'_is-checked': done})}>
      <Icon name="mark" />
    </div>

    <p className={style.text}>{title}</p>

    {executor_id &&
      <SubscriptionAvatar className={style.avatar} userId={executor_id} />
    }
  </Wrapper>;
};

export default compose(
  connect(
    (state, props) => ({
      title: get(state.tasks.list, `${props.id}.title`, ''),
      done: get(state.tasks.list, `${props.id}.done`, false),
      executor_id: get(state.tasks.list, `${props.id}.executor_id`),
    }),
  ),
)(Task);