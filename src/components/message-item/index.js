import React, { Component } from 'react';
import compose from 'recompose/compose';
import moment from 'moment';
import { connect } from 'react-redux';
import SubscriptionAvatar from '@/components/subscription-avatar';
import { withNamespaces } from 'react-i18next';
import classnames from 'classnames/bind';
import Icon from '@/components/icon';
import Button from '@/components/button';
import style from './style.css';

const cx = classnames.bind(style);

class MessageItem extends Component {
  getFileType = () => this.props.message.attachment.content_type.split('/').pop();

  getFileSizeKb = () => parseInt(this.props.message.attachment.byte_size / 1000, 10);

  render() {
    const isMessageDeleted = !!this.props.message.deleted_at;
    const isMessageHasImage = this.props.message.attachment && this.props.message.attachment.content_type.match('image/');
    const isMessageHasFile = this.props.message.attachment && !isMessageHasImage;
    const isMessageCurrentUser = this.props.message.user_id === this.props.currentUser.id;

    return <div className={cx(
      'message-item',
      this.props.className,

      {
        'current-user': isMessageCurrentUser,
        'opponent-user': !isMessageCurrentUser,
      },
    )}>
      {!isMessageDeleted &&
        <div className={style.actions}>
          <Button appearance="_icon-transparent" icon="dots" className={style.dropdown_button} />
          <Button appearance="_basic-transparent" text="Reply" icon="reply" className={style.button} />
        </div>
      }

      {isMessageDeleted &&
        <div className={style.content}>
          <p className={style.deleted_message_text}>{this.props.t('deleted_message')}</p>
        </div>
      }

      {!isMessageDeleted &&
        <div className={style.content}>
          {(isMessageHasFile || this.props.message.text) &&
            <div className={style.message_block}>
              {this.props.message.text &&
                <p className={style.text}>{this.props.message.text}</p>
              }

              {isMessageHasFile &&
                <div className={style.file}>
                  <Icon name="add-chat" />

                  <div className={style.section}>
                    <p className={style.name}>File</p>

                    <div className={style.subcaption}>
                      <p className={style.text}>Filename.{this.getFileType()}</p>

                      <span className={style.size}>
                        {this.getFileSizeKb()} {this.props.t('kb')}
                      </span>
                    </div>
                  </div>
                </div>
              }
            </div>
          }

          {isMessageHasImage &&
            <div className={style.image}>
              <img src={this.props.message.attachment.preview} />
            </div>
          }
        </div>
      }

      {!isMessageDeleted &&
        <div className={style.info}>
          <span className={style.time}>{moment(this.props.message.created_at).format('HH:mm')}</span>

          <SubscriptionAvatar
            userId={this.props.message.user_id}
            className={style.avatar}
          />
        </div>
      }
    </div>;
  }
}

export default compose(
  withNamespaces('translation'),

  connect(
    (state, props) => ({
      currentUser: state.currentUser,
      message: state.messages.list[props.id],
    }),
  ),
)(MessageItem);
