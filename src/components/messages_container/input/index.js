import React, { Component } from 'react';
import classnames from 'classnames/bind';
import Button from '@/components/button';
import style from './style.css';

const cx = classnames.bind(style);

class MessageInput extends Component {
  calcTextareaHeight = () => {
    this.textareaRef.style.height = '20px';

    if (this.textareaRef.scrollHeight > 20) {
      this.textareaRef.style.height = this.textareaRef.scrollHeight + 10 + 'px';
      this.inputWrapperRef.style.marginTop =  '10px';
    } else {
      this.inputWrapperRef.style.marginTop =  0;
    }
  };

  onInput = () => {
    this.calcTextareaHeight();
  };

  render() {
    return <div className={cx('input', this.props.className)}>
      <Button appearance="_icon-transparent" icon="attach" className={style.attach} />

      <div className={style.section}>
        {false && <div className={style.message}>
          <div className={style.message_content}>
            <p className={style.name}>Alexander Borodich</p>
            <p className={style.text}>Перевод utn, выставление счета, подпись дока</p>
          </div>

          <Button appearance="_icon-transparent" icon="close" className={style.close} />
        </div>}

        <div className={style.input_wrapper} ref={node => this.inputWrapperRef = node}>
          <textarea placeholder="Message" ref={node => this.textareaRef = node} onInput={this.onInput} />
          <button>Send</button>
        </div>
      </div>
    </div>;
  }
}

export default MessageInput;
