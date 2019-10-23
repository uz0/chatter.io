import React from 'react';
import style from './style.css';

const Input = () => {
  return <div className={style.input_container}>
    <input type="text" className={style.input} placeholder="Comment" />
    <button type="button" className={style.send}>Send</button>
  </div>;
};

export default Input;
