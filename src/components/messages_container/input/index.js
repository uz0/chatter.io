import React, { Component } from 'react';
import Button from '@/components/button';
import Content from './content';
import style from './style.css';

export { default as actions } from './actions';

export const attachInputId = 'attach-input';

class MessageInput extends Component {
  attach = () => {
    const input = document.querySelector(`#${attachInputId}`);

    if (!input) {
      return;
    }

    input.click();
  };

  render() {
    return <div className={style.input}>
      <Content className={style.content} />
      <Button appearance="_fab-divider" icon="plus" className={style.icon_button} onClick={this.attach} />
      <Button appearance="_fab-primary" icon="four-shapes" className={style.icon_button} />
      <button className={style.send}>Send</button>
    </div>;
  }
}

export default MessageInput;
