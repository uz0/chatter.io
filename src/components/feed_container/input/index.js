import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import classnames from 'classnames/bind';
import SubscriptionAvatar from '@/components/subscription-avatar';
import Button from '@/components/button';
import Attachments from './attachments';
import Textarea from './textarea';
import config from '@/config';
import { actions as notificationActions } from '@/components/notification';
import { actions as inputActions } from '@/components/messages_container/input';
import style from './style.css';

const cx = classnames.bind(style);
export const attachInputId = 'feed-input-attach';

class Input extends Component {
  state = {
    isTextareaFocused: false,
  };

  desktopDocumentKeyDown = event => {
    const textarea = document.querySelector('#feed-input');

    if (!textarea) {
      return;
    }

    if (event.keyCode === config.key_code.enter && !event.shiftKey && document.activeElement === textarea) {
      this.send();
    }
  };

  handleDocumentKeyDown = event => {
    if (!this.props.isMobile) {
      this.desktopDocumentKeyDown(event);
    }
  };

  onTextareaFocus = () => this.setState({ isTextareaFocused: true });
  onTextareaBlur = () => this.setState({ isTextareaFocused: false });

  attach = () => {
    const input = document.querySelector(`#${attachInputId}`);

    if (!input) {
      return;
    }

    input.click();
  };

  send = () => this.props.sendMessage({subscription_id: this.props.details_id});

  cancel = () => {
    const textarea = document.querySelector('#feed-input');

    if (!textarea) {
      return;
    }

    textarea.blur();
    this.props.reset();
  };

  componentDidMount() {
    window.addEventListener('keydown', this.handleDocumentKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleDocumentKeyDown);
  }

  render() {
    const isFooterShown = this.state.isTextareaFocused || this.props.isHasValue;

    return <div className={cx('input_container', this.props.className)}>
      <div className={style.section}>
        <SubscriptionAvatar userId={this.props.currentUser.id} className={style.avatar} />

        <div className={style.content}>
          <Textarea
            onFocus={this.onTextareaFocus}
            onBlur={this.onTextareaBlur}
            className={style.input}
          />

          <Attachments
            uniqueId={attachInputId}
            onChange={this.onAttachmentsChange}
            details_id={this.props.details_id}
          />
        </div>

        <Button appearance="_icon-transparent" icon="image" onClick={this.attach} className={style.attach} />
      </div>

      {isFooterShown &&
        <div className={style.footer}>
          <Button appearance="_basic-divider" text="Cancel" onClick={this.cancel} className={style.cancel} />
          <Button appearance="_basic-primary" text="Post" onClick={this.send} className={style.post} />
        </div>
      }
    </div>;
  }
}

export default compose(
  connect(
    state => ({
      currentUser: state.currentUser,
      isMobile: state.device === 'touch',
      isHasValue: state.input.value.length > 0 || (!!state.input.attachments && state.input.attachments.length > 0),
    }),

    {
      sendMessage: inputActions.sendMessage,
      reset: inputActions.reset,
      showNotification: notificationActions.showNotification,
    },
  ),
)(Input);
