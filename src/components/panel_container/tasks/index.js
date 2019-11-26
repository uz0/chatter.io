import React, { Component, Fragment } from 'react';
import get from 'lodash/get';
import map from 'lodash/map';
import filter from 'lodash/filter';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import Loading from '@/components/loading';
import Task from '@/components/task';
import { actions as modalActions } from '@/components/modal_container';
import { actions as tasksActions } from '@/store/tasks';
import { api } from '@';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

class Tasks extends Component {
  state = {
    filter: 'all',
    isLoading: false,
  };

  setFilter = filter => () => this.setState({ filter });

  openNewTaskModal = () => this.props.toggleModal({
    id: 'classic-edit-task-modal',

    options: {
      subscription_id: this.props.details.id,
    },
  });

  editTask = id => () => this.props.toggleModal({
    id: 'classic-edit-task-modal',

    options: {
      task_id: id,
    },
  });

  async componentWillReceiveProps(nextProps) {
    if (this.props.details_id !== nextProps.details_id && !nextProps.is_loaded) {
      this.setState({ isLoading: true });
      const { tasks } = await api.groupTasks({subscription_id: nextProps.details.id});
      this.setState({ isLoading: false });

      if (tasks) {
        this.props.loadTasks(tasks);
      }
    }
  }

  async componentWillMount() {
    if (!this.props.is_loaded) {
      this.setState({ isLoading: true });
      const { tasks } = await api.groupTasks({subscription_id: this.props.details.id});
      this.setState({ isLoading: false });

      if (tasks) {
        this.props.loadTasks(tasks);
      }
    }
  }

  render() {
    let tasks = this.props.tasks;

    if (this.state.filter === 'all') {
      tasks = filter(tasks, {done: false});
    }

    if (this.state.filter === 'my') {
      tasks = filter(tasks, {
        executor_id: this.props.currentUserId,
        done: false,
      });
    }

    if (this.state.filter === 'archived') {
      tasks = filter(tasks, {done: true});
    }

    const isTasksExist = tasks.length > 0;

    return <Fragment>
      <div className={style.navigation}>
        <button
          type="button"
          className={cx('tab', {'_is-active': this.state.filter === 'all'})}
          onClick={this.setFilter('all')}
        >All</button>

        <button
          type="button"
          className={cx('tab', {'_is-active': this.state.filter === 'my'})}
          onClick={this.setFilter('my')}
        >My tasks</button>

        <button
          type="button"
          className={cx('tab', {'_is-active': this.state.filter === 'archived'})}
          onClick={this.setFilter('archived')}
        >Archived</button>

        <button type="button" className={style.new} onClick={this.openNewTaskModal}>New</button>
      </div>

      {isTasksExist &&
        tasks.map(task => <Task
          key={task.id}
          id={task.id}
          onClick={this.editTask(task.id)}
          className={style.item}
        />)
      }

      {!isTasksExist &&
        <p className={style.empty}>There is no tasks</p>
      }

      {false &&
        <button type="button" className={style.all}>Show all (21)</button>
      }

      {this.state.isLoading &&
        <Loading isShown className={style.loading} />
      }
    </Fragment>;
  }
}

export default compose(
  connect(
    (state, props) => ({
      currentUserId: state.currentUser.id,
      details: state.subscriptions.list[props.details_id],
    }),

    {
      loadTasks: tasksActions.loadTasks,
      toggleModal: modalActions.toggleModal,
    },
  ),

  connect(
    (state, props) => ({
      tasks: map(get(state.tasks, `groups.${props.details.group_id}.list`, []), id => state.tasks.list[id]),
      is_loaded: get(state.tasks, `groups.${props.details.group_id}.isLoaded`, false),
    }),

    {
      loadTasks: tasksActions.loadTasks,
      toggleModal: modalActions.toggleModal,
    },
  ),
)(Tasks);
