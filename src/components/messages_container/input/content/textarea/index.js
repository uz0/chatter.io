import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import throttle from 'lodash/throttle';
import { pasteFromClipboard, calcTextareaHeight } from '@/helpers';
import { attachInputId } from '@/components/messages_container/input';
import actions from '@/components/messages_container/input/actions';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

class Textarea extends Component {
  onTextareaKeyDown = event => {
    if (event.keyCode === 13) {
      event.preventDefault();
    }
  };

  setNewLineTextarea = () => {
    const textarea = document.querySelector('#textarea');

    if (!textarea) {
      return;
    }

    const selection = textarea.selectionStart;
    const newValue = this.props.value.substring(0, selection) + '\n' + this.props.value.substring(selection, this.props.value.length);
    this.props.setText(newValue);
    calcTextareaHeight();
    setTimeout(() => textarea.setSelectionRange(selection + 1, selection + 1));
  };

  mobileDocumentKeyDown = event => {
    const textarea = document.querySelector('#textarea');

    if (!textarea) {
      return;
    }

    if (event.keyCode === 13 && document.activeElement === textarea) {
      this.setNewLineTextarea();
    }
  };

  desktopDocumentKeyDown = event => {
    const textarea = document.querySelector('#textarea');

    if (!textarea) {
      return;
    }

    if (event.keyCode === 13 && event.shiftKey && document.activeElement === textarea) {
      this.setNewLineTextarea();
    }
  };

  handleDocumentKeyDown = event => {
    if (this.props.isMobile) {
      this.mobileDocumentKeyDown(event);
    } else {
      this.desktopDocumentKeyDown(event);
    }
  };

  updateDraft = value => {
    const textarea = document.querySelector('#textarea');

    if (!textarea) {
      return;
    }

    // момент, когда сообщение уже отправлено,
    // через пол секунды иногда проскакивает старый драфт
    if (!textarea.value && value) {
      return;
    }

    this.props.updateDraft({ id: this.props.subscription_id, value });
  };

  throttleUpdateDraft = throttle(this.updateDraft, 500);
  onInput = event => this.props.setText(event.target.value);
  onPaste = event => pasteFromClipboard(event, attachInputId);
  onChange = () => {};

  componentWillReceiveProps(nextProps) {
    // тут, а не в onInput, т.к. например в меншенах есть тоже вставка текста в стор
    // и тут мы словим обновление пересчет высоты и для того случая, и для этого
    if (this.props.value !== nextProps.value) {
      setTimeout(() => calcTextareaHeight());

      if (!nextProps.edit_message_id && !nextProps.reply_message_id) {
        setTimeout(() => this.throttleUpdateDraft(nextProps.value));
      }
    }
  }

  componentDidMount() {
    window.addEventListener('keydown', this.handleDocumentKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleDocumentKeyDown);
  }

  render() {
    return <div className={cx('container', this.props.className)}>
      <textarea
        id="textarea"
        placeholder="Message"
        value={this.props.value}
        onInput={this.onInput}
        onPaste={this.onPaste}
        onChange={this.onChange}
        onKeyDown={this.onTextareaKeyDown}
        className={style.textarea}
      />
    </div>;
  }
}

export default compose(
  connect(
    state => ({
      edit_message_id: state.messages.edit_message_id,
      reply_message_id: state.messages.reply_message_id,
      value: state.input.value,
      isMobile: state.device === 'touch',
    }),

    {
      updateDraft: actions.updateDraft,
      setText: actions.setText,
    },
  ),
)(Textarea);
