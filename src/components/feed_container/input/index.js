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

  attach = () => {
    const input = document.querySelector(`#${attachInputId}`);

    if (!input) {
      return;
    }

    input.click();
  };

  send = () => this.props.sendMessage({subscription_id: this.props.details_id});

  componentDidMount() {
    window.addEventListener('keydown', this.handleDocumentKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleDocumentKeyDown);
  }

  render() {
    return <div className={cx('input_container', this.props.className)}>
      <div className={style.section}>
        <SubscriptionAvatar userId={this.props.currentUser.id} className={style.avatar} />
        <Textarea className={style.input} />
        <Button appearance="_icon-transparent" icon="attach" className={style.attach} onClick={this.attach} />
        <Button appearance="_fab-divider" icon="plus" className={style.action} onClick={this.send} />
      </div>

      <Attachments
        uniqueId={attachInputId}
        onChange={this.onAttachmentsChange}
        details_id={this.props.details_id}
      />
    </div>;
  }
}

export default compose(
  connect(
    state => ({
      currentUser: state.currentUser,
      isMobile: state.device === 'touch',
    }),

    {
      sendMessage: inputActions.sendMessage,
      showNotification: notificationActions.showNotification,
    },
  ),
)(Input);
