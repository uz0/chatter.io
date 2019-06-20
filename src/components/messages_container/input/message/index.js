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
    const isMessageHasText = (this.props.message.text || '').replace(/\s/g,'').length > 0;
    const isMessageHasAttachment = !!this.props.message.attachment;
    const isAttachmentImage = isMessageHasAttachment && this.props.message.attachment.content_type.match('image/');
    const attachment = isAttachmentImage ? '<image>' : '<file>';

    return <div className={cx('message', this.props.className)}>
      <div className={style.message_content}>
        <p className={style.name}>{nick}</p>

        {isMessageHasText &&
          <p className={style.text}>{this.props.message.text}</p>
        }

        {isMessageHasAttachment &&
          <p className={style.text}>
            <span>{attachment}</span>
          </p>
        }
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
