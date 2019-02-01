import React, { Component } from 'react';
import classnames from 'classnames/bind';
import Icon from '@/components/icon';
import Button from '@/components/button';
import style from './style.css';

const cx = classnames.bind(style);

class MessageItem extends Component {
  render() {
    const random = Math.random();

    return <div className={cx(
      'message-item',
      this.props.className,

      {
        'current-user': random < 0.5,
        'opponent-user': random >= 0.5,
      },
    )}>
      <div className={style.actions}>
        <Button appearance="_icon-transparent" icon="dots" className={style.dropdown_button} />
        <Button appearance="_basic-transparent" text="Reply" icon="reply" className={style.button} />
      </div>

      <div className={style.content}>
        <div className={style.message_block}>
          <p className={style.text}>Hi! New iteration of the Universa:</p>

          <div className={style.file}>
            <Icon name="add-chat" />

            <div className={style.section}>
              <p className={style.name}>Logo</p>

              <div className={style.subcaption}>
                <p className={style.text}>Sketch_logo.sketch</p>
                <span className={style.size}>12 mb</span>
              </div>
            </div>
          </div>
        </div>

        <div className={style.image}>
          <img src="/assets/default-image.jpg" />
        </div>
      </div>

      <div className={style.info}>
        <span className={style.time}>10:30</span>
        <div className={style.avatar} style={{ '--photo': 'url(/assets/default-user.jpg)' }} />
      </div>
    </div>;
  }
}

export default MessageItem;
