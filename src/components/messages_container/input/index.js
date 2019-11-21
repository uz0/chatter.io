import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import get from 'lodash/get';
import Icon from '@/components/icon';
import Button from '@/components/button';
import Dropdown from '@/components/dropdown';
import config from '@/config';
import Content from './content';
import Mentions from './mentions';
import actions from './actions';
import { actions as modalActions } from '@/components/modal_container';
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

  createTodo = () => this.props.toggleModal({
    id: 'classic-edit-task-modal',

    options: {
      subscription_id: this.props.subscription_id,
      is_input: true,
    },
  });

  send = () => this.props.sendMessage({ subscription_id: this.props.subscription_id });

  componentDidMount() {
    window.addEventListener('keydown', this.handleDocumentKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleDocumentKeyDown);
  }

  render() {
    if (this.props.isCheckShown) {
      return null;
    }

    const items = [
      {text: 'Files', onClick: this.attach},
      {text: 'To-Do', onClick: this.createTodo},
    ];

    return <div className={style.input}>
      <Mentions subscription_id={this.props.subscription_id} className={style.mentions} />
      <Content subscription_id={this.props.subscription_id} className={style.content} />

      <Dropdown
        uniqueId="input-attach-dropdown"
        items={items}
        className={style.dropdown}
      >
        <Button appearance="_fab-divider" icon="plus" className={style.icon_button} />
      </Dropdown>

      {false &&
        <Button appearance="_fab-primary" icon="four-shapes" className={style.icon_button} />
      }

      <button className={style.send} onClick={this.send}>
        <Icon name="send" />
      </button>
    </div>;
  }
}

export default compose(
  connect(
    state => ({
      isMobile: state.device === 'touch',
      isSuggestionShown: get(state.dropdown, 'suggestion-dropdown.isShown', false),
      isCheckShown: state.messages.checked_ids.length > 0,
    }),

    {
      sendMessage: actions.sendMessage,
      reset: actions.reset,
      toggleModal: modalActions.toggleModal,
    },
  ),
)(MessageInput);
