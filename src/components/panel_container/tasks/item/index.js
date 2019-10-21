import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

class Task extends Component {
  render() {
    return <div className={cx('task', this.props.className)}>
      <div className={style.circle} />
      <p className={style.text}>{this.props.task.title}</p>

      {/* <SubscriptionAvatar className={style.avatar} userId={55} /> */}
    </div>;
  }
}

export default compose(
  connect(
    (state, props) => ({
      task: state.tasks.list[props.id],
    }),
  ),
)(Task);
