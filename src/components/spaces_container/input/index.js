import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import classnames from 'classnames/bind';
import SubscriptionAvatar from '@/components/subscription-avatar';
import Button from '@/components/button';
import Icon from '@/components/icon';
import { actions as notificationActions } from '@/components/notification';
import { actions as inputActions } from '@/components/messages_container/input';
import style from './style.css';

const cx = classnames.bind(style);

class Input extends Component {
  state = {
    value: '',
  };

  onInput = event => this.setState({ value: event.target.value });

  // дубликат
  getFilteredMessage = value => {
    if (!value) {
      return '';
    }

    let text = value.replace(/\r|\n|\r\n/g, '<br />');

    if (text[0] === ' ') {
      text = text.substring(1);
    }

    if (text[text.length - 1] === ' ') {
      text = text.substring(0, text.length - 1);
    }

    return text;
  };

  send = () => {
    const text = this.getFilteredMessage(this.state.value);

    if (!text) {
      this.props.showNotification({
        type: 'info',
        text: 'No data to send',
      });

      return;
    }

    this.props.sendMessage({
      subscription_id: this.props.details_id,
      text,
    });

    this.setState({ value: '' });
  };

  render() {
    return <div className={cx('input_container', this.props.className)}>
      <div className={style.section}>
        <SubscriptionAvatar userId={this.props.currentUser.id} className={style.avatar} />

        <input
          placeholder="Post to #design"
          value={this.state.value}
          onInput={this.onInput}
          onChange={() => {}}
          className={style.input}
        />

        <Button appearance="_icon-transparent" icon="attach" className={style.attach} onClick={this.attach} />
        <Button appearance="_fab-divider" icon="plus" className={style.action} onClick={this.send} />
      </div>

      <div className={style.attaches}>
        <div className={style.gallery}>
          <div className={style.preview} style={{ '--image': 'url(/assets/default-image.jpg)' }}>
            <button className={style.close}>
              <Icon name="close" />
            </button>
          </div>

          <div className={style.preview} style={{ '--image': 'url(/assets/default-image.jpg)' }}>
            <button className={style.close}>
              <Icon name="close" />
            </button>
          </div>
        </div>

        <div className={style.files}>
          <div className={style.file}>
            <Icon name="file" />
            <p className={style.name}>File name</p>
            <span className={style.size}>115 kb</span>

            <button className={style.delete}>
              <Icon name="close" />
            </button>
          </div>

          <div className={style.file}>
            <Icon name="file" />
            <p className={style.name}>File name</p>
            <span className={style.size}>115 kb</span>

            <button className={style.delete}>
              <Icon name="close" />
            </button>
          </div>
        </div>
      </div>
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
