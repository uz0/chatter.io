import React from 'react';
import List from './list';
import Input from './input';
import style from './style.css';

const Comments = () => {
  return <div className={style.comments}>
    <List />
    <Input />
  </div>;
};

export default Comments;
