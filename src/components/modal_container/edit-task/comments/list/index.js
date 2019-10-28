import React from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import get from 'lodash/get';
import map from 'lodash/map';
import Message from './message';
import style from './style.css';

const List = ({ comments_ids, task_id }) => {
  if (comments_ids.length === 0) {
    return null;
  }

  return <div className={style.list}>
    {false &&
      <button type="button" className={style.show}>Show all comments (33)</button>
    }

    {comments_ids.map(id => {
      return <Message key={id} id={id} task_id={task_id} />;
    })}
  </div>;
};

export default compose(
  connect(
    (state, props) => ({
      comments_ids: map(get(state.tasks.list, `${props.task_id}.comments`, []), 'id', []),
    }),
  ),
)(List);
