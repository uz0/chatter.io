import React, { Component } from 'react';
import { scrollMessagesBottom, pasteFromClipboard } from '@/helpers';
import classnames from 'classnames/bind';
import { attachInputId } from '../../';
import style from './style.css';

const cx = classnames.bind(style);

class Textarea extends Component {
  onInput = () => {
    this.calcTextareaHeight();
  };

  onPaste = event => pasteFromClipboard(event, attachInputId);

  calcTextareaHeight = () => {
    const textarea = document.querySelector('#textarea');

    if (!textarea) {
      return;
    }

    scrollMessagesBottom(() => {
      textarea.style.height = '20px';
      textarea.style.height = `${textarea.scrollHeight}px`;
    });
  };

  render() {
    return <div className={cx('container', this.props.className)}>
      <textarea
        id="textarea"
        placeholder="Message"
        onInput={this.onInput}
        onPaste={this.onPaste}
        className={style.textarea}
      />
    </div>;
  }
}

export default Textarea;
