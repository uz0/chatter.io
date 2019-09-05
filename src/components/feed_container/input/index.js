import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import map from 'lodash/map';
import classnames from 'classnames/bind';
import SubscriptionAvatar from '@/components/subscription-avatar';
import Button from '@/components/button';
import Attachments from './attachments';
import { getFilteredMessage, pasteFromClipboard } from '@/helpers';
import { actions as notificationActions } from '@/components/notification';
import { actions as inputActions } from '@/components/messages_container/input';
import style from './style.css';

const cx = classnames.bind(style);
const attachInputId = 'feed-input-attach';

class Input extends Component {
  state = {
    upload_id: [],
  };

  onInput = () => this.calcTextareaHeight();

  calcTextareaHeight = () => {
    const textarea = document.getElementById('feed-input');

    if (!textarea) {
      return;
    }

    textarea.style.height = '20px';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  attach = () => {
    const input = document.getElementById(attachInputId);
    input.click();
  };

  onAttachmentsChange = data => {
    const upload_id = map(data, item => item.upload_id);
    this.setState({ upload_id });
  };

  onPaste = event => pasteFromClipboard(event, attachInputId);

  send = () => {
    const input = document.getElementById('feed-input');
    const text = getFilteredMessage(input.value);
    const { upload_id } = this.state;

    if (!text && upload_id.length === 0) {
      this.props.showNotification({
        type: 'info',
        text: 'No data to send',
      });

      return;
    }

    this.props.sendMessage({
      subscription_id: this.props.details_id,
      ...text ? { text } : {},
      ...upload_id ? { upload_id } : {},
    });

    input.value = '';
  };

  componentWillReceiveProps(nextProps) {
    const input = document.getElementById('feed-input');

    if (this.props.details_id !== nextProps.details_id && input.value) {
      input.value = '';
      this.setState({ upload_id: [] });
    }
  }

  render() {
    return <div className={cx('input_container', this.props.className)}>
      <div className={style.section}>
        <SubscriptionAvatar userId={this.props.currentUser.id} className={style.avatar} />

        <textarea
          id="feed-input"
          placeholder="Post to #design"
          onInput={this.onInput}
          onPaste={this.onPaste}
          className={style.input}
        />

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
    }),

    {
      sendMessage: inputActions.sendMessage,
      showNotification: notificationActions.showNotification,
    },
  ),
)(Input);
