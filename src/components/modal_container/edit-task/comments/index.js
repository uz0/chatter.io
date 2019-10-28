import React from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import get from 'lodash/get';
import List from './list';
import Input from './input';
import style from './style.css';

const Comments = ({
  task_id,
  count_comments,
}) => {
  const isCommentsExist = count_comments > 0;

  return <div className={style.comments}>
    {isCommentsExist &&
      <List task_id={task_id} />
    }

    <Input task_id={task_id} />
  </div>;
};

export default compose(
  connect(
    (state, props) => ({
      count_comments: get(state.tasks.list, `${props.task_id}.count_comments`, 0),
    }),
  ),
)(Comments);
