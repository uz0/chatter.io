import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import map from 'lodash/map';
import classnames from 'classnames/bind';
import SubscriptionAvatar from '@/components/subscription-avatar';
import Button from '@/components/button';
import Attachments from './attachments';
import { getFilteredMessage } from '@/helpers';
import { actions as notificationActions } from '@/components/notification';
import { actions as inputActions } from '@/components/messages_container/input';
import style from './style.css';

const cx = classnames.bind(style);

class Input extends Component {
  state = {
    upload_id: [],
  };

  send = () => {
    const input = document.getElementById('spaces-input');
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

  attach = () => {
    const input = document.getElementById('spaces-input-attach');
    input.click();
  };

  onAttachmentsChange = data => {
    const upload_id = map(data, item => item.upload_id);
    this.setState({ upload_id });
  };

  componentWillReceiveProps(nextProps) {
    const input = document.getElementById('spaces-input');

    if (this.props.details_id !== nextProps.details_id && input.value) {
      input.value = '';
      this.setState({ upload_id: [] });
    }
  }

  render() {
    return <div className={cx('input_container', this.props.className)}>
      <div className={style.section}>
        <SubscriptionAvatar userId={this.props.currentUser.id} className={style.avatar} />

        <input
          id="spaces-input"
          placeholder="Post to #design"
          className={style.input}
        />

        <Button appearance="_icon-transparent" icon="attach" className={style.attach} onClick={this.attach} />
        <Button appearance="_fab-divider" icon="plus" className={style.action} onClick={this.send} />
      </div>

      <Attachments
        uniqueId="spaces-input-attach"
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
