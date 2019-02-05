import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import classnames from 'classnames/bind';
import Button from '@/components/button';
import style from './style.css';

const cx = classnames.bind(style);

class Message extends Component {
  render() {
    const nick = this.props.user.nick || 'no nick';

    return <div className={cx('message', this.props.className)}>
      <div className={style.message_content}>
        <p className={style.name}>{nick}</p>
        <p className={style.text}>{this.props.message.text}</p>
      </div>

      <Button appearance="_icon-transparent" icon="close" className={style.close} onClick={this.props.onClose} />
    </div>;
  }
}

export default compose(
  connect(
    (state, props) => ({
      message: state.messages.list[props.id],
    }),
  ),

  connect(
    (state, props) => ({
      user: state.users.list[props.message.user_id],
    }),
  ),
)(Message);
