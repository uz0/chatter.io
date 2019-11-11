import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { actions as inputActions } from '@/components/messages_container/input';
import config from '@/config';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

class Textarea extends Component {
  onTextareaKeyDown = event => {
    if (event.keyCode === config.key_code.enter) {
      event.preventDefault();
    }
  };

  calcTextareaHeight = () => {
    const textarea = document.querySelector('#feed-input');

    if (!textarea) {
      return;
    }

    textarea.style.height = '20px';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  onInput = event => this.props.setText(event.target.value);
  onChange = () => {};

  componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value) {
      setTimeout(() => this.calcTextareaHeight());
    }
  }

  render() {
    return <textarea
      id="feed-input"
      placeholder="Post to #design"
      onInput={this.onInput}
      value={this.props.value}
      onChange={this.onChange}
      onKeyDown={this.onTextareaKeyDown}
      onFocus={this.props.onFocus}
      onBlur={this.props.onBlur}
      className={cx('input', this.props.className)}
    />;
  }
}

export default compose(
  connect(
    state => ({
      value: state.input.value,
    }),

    {
      setText: inputActions.setText,
    },
  ),
)(Textarea);
