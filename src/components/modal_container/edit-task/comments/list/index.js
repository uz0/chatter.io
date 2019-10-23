import React from 'react';
import Message from './message';
import style from './style.css';

const List = () => {
  return <div className={style.list}>
    <button type="button" className={style.show}>Show all comments (33)</button>
    <Message user="opponent" />
    <Message user="opponent" />
    <Message user="current" />
  </div>;
};

export default List;
