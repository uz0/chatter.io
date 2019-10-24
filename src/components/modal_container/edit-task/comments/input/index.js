import React, { Component } from 'react';
import { api } from '@';
import style from './style.css';

class Input extends Component {
  state = {
    value: '',
  };

  onInput = event => this.setState({ value: event.target.value });
  onChange = () => {};

  send = async () => {
    const qwe = await api.create_task_comment({
      task_id: this.props.task_id,
      text: this.state.value,
    });

    console.log(qwe);
  };

  render() {
    const isInputHasText = this.state.value.split(' ').join('').length > 0;

    return <div className={style.input_container}>
      <input
        type="text"
        value={this.state.value}
        onInput={this.onInput}
        onChange={this.onChange}
        className={style.input}
        placeholder="Comment"
      />

      {isInputHasText &&
        <button type="button" className={style.send} onClick={this.send}>Send</button>
      }
    </div>;
  }
}

export default Input;
