import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import get from 'lodash/get';
import Button from '@/components/button';
import config from '@/config';
import Content from './content';
import Mentions from './mentions';
import actions from './actions';
import style from './style.css';

export { default as actions } from './actions';
export { default as reducers } from './reducers';

export const attachInputId = 'attach-input';

class MessageInput extends Component {
  desktopDocumentKeyDown = event => {
    const textarea = document.querySelector('#textarea');

    if (!textarea) {
      return;
    }

    if (event.keyCode === config.key_code.enter && !this.props.isSuggestionShown && !event.shiftKey && document.activeElement === textarea) {
      this.send();
    }
  };

  handleDocumentKeyDown = event => {
    if (!this.props.isMobile) {
      this.desktopDocumentKeyDown(event);
    }
  };

  attach = () => {
    const input = document.querySelector(`#${attachInputId}`);

    if (!input) {
      return;
    }

    input.click();
  };

  send = () => this.props.sendMessage({ subscription_id: this.props.subscription_id });

  componentDidMount() {
    window.addEventListener('keydown', this.handleDocumentKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleDocumentKeyDown);
  }

  render() {
    return <div className={style.input}>
      <Mentions subscription_id={this.props.subscription_id} className={style.mentions} />
      <Content subscription_id={this.props.subscription_id} className={style.content} />
      <Button appearance="_fab-divider" icon="plus" className={style.icon_button} onClick={this.attach} />

      {false &&
        <Button appearance="_fab-primary" icon="four-shapes" className={style.icon_button} />
      }

      <button className={style.send} onClick={this.send}>Send</button>
    </div>;
  }
}

export default compose(
  connect(
    state => ({
      isMobile: state.device === 'touch',
      isSuggestionShown: get(state.dropdown, 'suggestion-dropdown.isShown', false),
    }),

    {
      sendMessage: actions.sendMessage,
      reset: actions.reset,
    },
  ),
)(MessageInput);
