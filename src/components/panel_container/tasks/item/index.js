import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import SubscriptionAvatar from '@/components/subscription-avatar';
import { actions as modalActions } from '@/components/modal_container';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

class Task extends Component {
  openTask = () => this.props.toggleModal({
    id: 'classic-edit-task-modal',

    options: {
      task_id: this.props.id,
    },
  });

  render() {
    return <button type="button" className={cx('task', this.props.className)} onClick={this.openTask}>
      <div className={style.circle} />
      <p className={style.text}>{this.props.task.title}</p>

      {this.props.task.executor_id &&
        <SubscriptionAvatar className={style.avatar} userId={this.props.task.executor_id} />
      }
    </button>;
  }
}

export default compose(
  connect(
    (state, props) => ({
      task: state.tasks.list[props.id],
    }),

    {
      toggleModal: modalActions.toggleModal,
    },
  ),
)(Task);
