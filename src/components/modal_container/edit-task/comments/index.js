import React from 'react';
import List from './list';
import Input from './input';
import style from './style.css';

const Comments = ({
  task_id,
}) => {
  return <div className={style.comments}>
    <List task_id={task_id} />
    <Input task_id={task_id} />
  </div>;
};

export default Comments;
