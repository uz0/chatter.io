import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import get from 'lodash/get';
import Loading from '@/components/loading';
import Message from './message';
import { api } from '@';
import { actions as tasksActions } from '@/store/tasks';
import style from './style.css';

class List extends Component {
  state = {
    isLoading: false,
  };

  async componentWillReceiveProps(nextProps) {
    if (nextProps.count_comments > this.props.count_comments) {
      const { task_comments } = await api.taskComments({
        task_id: this.props.task_id,
        offset: 0,
        limit: 1,
      });

      if (task_comments[0]) {
        this.props.addTaskComment({
          id: this.props.task_id,
          comment: task_comments[0],
        });
      }
    }
  }

  async componentDidMount() {
    if (!this.props.isLoaded) {
      this.setState({ isLoading: true });
      const { task_comments } = await api.taskComments({task_id: this.props.task_id});
      this.setState({ isLoading: false });

      this.props.loadTaskComments({
        id: this.props.task_id,
        comments: task_comments,
      });
    }
  }

  render() {
    const ids = [...this.props.comments_ids].sort((prev, next) => prev - next);

    return <div className={style.list}>
      {false &&
        <button type="button" className={style.show}>Show all comments (33)</button>
      }

      {ids.map(id => {
        return <Message key={id} id={id} task_id={this.props.task_id} />;
      })}

      {this.state.isLoading &&
        <Loading className={style.loading} isShown />
      }
    </div>;
  }
}

export default compose(
  connect(
    (state, props) => ({
      comments_ids: get(state.tasks.list, `${props.task_id}.comments.ids`, []),
      count_comments: get(state.tasks.list, `${props.task_id}.count_comments`, 0),
      isLoaded: get(state.tasks.list, `${props.task_id}.comments.isLoaded`, false),
    }),

    {
      loadTaskComments: tasksActions.loadTaskComments,
      addTaskComment: tasksActions.addTaskComment,
    },
  ),
)(List);
