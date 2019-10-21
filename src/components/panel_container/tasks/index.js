import React, { Component, Fragment } from 'react';
import get from 'lodash/get';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import Loading from '@/components/loading';
import Item from './item';
import { actions as modalActions } from '@/components/modal_container';
import { actions as tasksActions } from '@/store/tasks';
// import { getOpponentUser } from '@/helpers';
import { api } from '@';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

class Tasks extends Component {
  state = {
    isLoading: false,
  };

  openNewTaskModal = () => {
    let options = {
      group_id: this.props.details.group_id,
    };

    // if (this.props.details.group.type === 'private_chat') {
    //   const user = getOpponentUser(this.props.details);
    //   options['executor_id'] = user.id;
    // } else if (this.props.details.group.type === 'organization_public_room') {
    //   const { organization_id } = this.props.details.group;
    //   options['organization_id'] = organization_id;
    // }

    this.props.toggleModal({
      id: 'classic-new-task-modal',
      options,
    });
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
    const isTasksExist = this.props.tasks_ids.length > 0;

    return <Fragment>
      <div className={style.navigation}>
        <button type="button" className={cx('tab', {'_is-active': true})}>All</button>
        <button type="button" className={style.tab}>My tasks</button>
        <button type="button" className={style.tab}>Archived</button>
        <button type="button" className={style.new} onClick={this.openNewTaskModal}>New</button>
      </div>

      {isTasksExist &&
        this.props.tasks_ids.map(id => <Item key={id} id={id} className={style.item} />)
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
      details: state.subscriptions.list[props.details_id],
    }),

    {
      loadTasks: tasksActions.loadTasks,
      toggleModal: modalActions.toggleModal,
    },
  ),

  connect(
    (state, props) => ({
      tasks_ids: get(state.tasks, `groups.${props.details.group_id}.list`, []),
      is_loaded: get(state.tasks, `groups.${props.details.group_id}.isLoaded`, false),
    }),

    {
      loadTasks: tasksActions.loadTasks,
      toggleModal: modalActions.toggleModal,
    },
  ),
)(Tasks);
