import React, { Component, Fragment } from 'react';
import compose from 'recompose/compose';
import get from 'lodash/get';
import groupBy from 'lodash/groupBy';
import filter from 'lodash/filter';
import { connect } from 'react-redux';
import Icon from '@/components/icon';
import SubscriptionAvatar from '@/components/subscription-avatar';
import { ClickOutside } from 'reactjs-click-outside';
import { api } from '@';
import { actions as tasksActions } from '@/store/tasks';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

class Tasks extends Component {
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

  shouldComponentUpdate(nextProps) {
    const isOrganizationChanged = this.props.organization_id !== nextProps.organization_id;
    const isCountTasksFromMeChanged = this.props.tasks.length !== nextProps.tasks.length;
    const ifIsLoadedChanged = this.props.isLoaded !== nextProps.isLoaded;

    return isOrganizationChanged ||
      ifIsLoadedChanged ||
      isCountTasksFromMeChanged;
  }

  render() {
    const groupedTasks = groupBy(this.props.tasks, 'creator_id');
    const isTasksExist = Object.keys(groupedTasks).length > 0;

    return <ClickOutside outsideCall={this.props.close}>
      <div className={cx('popup', this.props.className)}>
        <div className={style.navigation}>
          <button type="button" className={cx('tab', {'_is-active': true})}>All tasks</button>
          <button type="button" className={cx('tab')}>My tasks</button>

          <button className={style.open}>
            <Icon name="full-screen-half" />
          </button>
        </div>

        <div className={style.list}>
          <button className={style.new}>+ New To-Do</button>

          {Object.keys(groupedTasks).map(key => {
            const group = groupedTasks[key];
            const creator = group[0].creator;
            const name = creator.nick || 'no name';

            return <Fragment key={key}>
              <div className={style.section}>
                <SubscriptionAvatar className={style.avatar} userId={creator.id} />
                <p className={style.name}>{name}</p>
                <button className={style.all}>See all</button>
              </div>

              {group.map(task => {
                return <div key={task.id} className={style.task}>
                  <div className={style.circle} />
                  <p className={style.title}>{task.title}</p>

                  {task.executor_id &&
                    <SubscriptionAvatar className={style.avatar} userId={task.executor_id} />
                  }
                </div>;
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
    },
  ),
)(Tasks);
