import React, { Component, Fragment } from 'react';
import compose from 'recompose/compose';
import get from 'lodash/get';
import groupBy from 'lodash/groupBy';
import filter from 'lodash/filter';
import { connect } from 'react-redux';
import Icon from '@/components/icon';
import Task from '@/components/task';
import SubscriptionAvatar from '@/components/subscription-avatar';
import { ClickOutside } from 'reactjs-click-outside';
import { api } from '@';
import { actions as modalActions } from '@/components/modal_container';
import { actions as tasksActions } from '@/store/tasks';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

class Tasks extends Component {
  state = {
    filter: 'all',
  };

  setTab = filter => () => this.setState({ filter });

  newTodo = () => this.props.toggleModal({
    id: 'classic-edit-task-modal',

    options: {
      organization_id: this.props.organization_id,
    },
  });

  openTask = id => () => this.props.toggleModal({
    id: 'classic-edit-task-modal',

    options: {
      task_id: id,
    },
  });

  async componentWillMount() {
    if (!this.props.isLoaded) {
      const { tasks } = await api.organizationTasks({ organization_id: this.props.organization_id });
      this.props.loadOrganizationTasks(tasks);
    }
  }

  async componentWillReceiveProps(nextProps) {
    const isOrganizationChanged = this.props.organization_id !== nextProps.organization_id;

    if (isOrganizationChanged && !nextProps.isLoaded) {
      const { tasks } = await api.organizationTasks({ organization_id: nextProps.organization_id });
      this.props.loadOrganizationTasks(tasks);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const isOrganizationChanged = this.props.organization_id !== nextProps.organization_id;
    const isCountTasksFromMeChanged = this.props.tasks.length !== nextProps.tasks.length;
    const ifIsLoadedChanged = this.props.isLoaded !== nextProps.isLoaded;
    const isFilterChanged = this.state.filter !== nextState.filter;

    return isOrganizationChanged ||
      ifIsLoadedChanged ||
      isFilterChanged ||
      isCountTasksFromMeChanged;
  }

  render() {
    let tasks = filter(this.props.tasks, task => !!task.group_id);

    if (this.state.filter === 'my') {
      tasks = filter(tasks, {executor_id: this.props.currentUserId});
    }

    const groupedTasks = groupBy(tasks, 'group_id');
    const isTasksExist = Object.keys(groupedTasks).length > 0;

    return <ClickOutside outsideCall={this.props.close}>
      <div className={cx('popup', this.props.className)}>
        <div className={style.navigation}>
          <button
            type="button"
            className={cx('tab', {'_is-active': this.state.filter === 'all'})}
            onClick={this.setTab('all')}
          >All tasks</button>

          <button
            type="button"
            className={cx('tab', {'_is-active': this.state.filter === 'my'})}
            onClick={this.setTab('my')}
          >My tasks</button>

          <button className={style.open}>
            <Icon name="full-screen-half" />
          </button>
        </div>

        <div className={style.list}>
          <button className={style.new} onClick={this.newTodo}>+ New To-Do</button>

          {Object.keys(groupedTasks).map(key => {
            const group = groupedTasks[key];
            const groupId = group[0].group_id;

            return <Fragment key={key}>
              <div className={style.section}>
                <SubscriptionAvatar className={style.avatar} groupId={groupId} />
                <p className={style.name}>123</p>
                <button className={style.all}>See all</button>
              </div>

              {group.map(task => {
                return <Task
                  key={task.id}
                  id={task.id}
                  onClick={this.openTask(task.id)}
                  className={style.task}
                />;
              })}
            </Fragment>;
          })}

          {!isTasksExist &&
            <p className={style.empty}>There is no tasks</p>
          }
        </div>
      </div>
    </ClickOutside>;
  }
}

export default compose(
  connect(
    (state, props) => ({
      currentUserId: state.currentUser.id,
      isLoaded: get(state.tasks.organizations, `${props.organization_id}.isLoaded`, false),
      tasks: filter(state.tasks.list, {organization_id: props.organization_id}),
    }),

    {
      loadOrganizationTasks: tasksActions.loadOrganizationTasks,
      toggleModal: modalActions.toggleModal,
    },
  ),
)(Tasks);
