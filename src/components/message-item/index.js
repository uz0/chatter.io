import React, { Component } from 'react';
import compose from 'recompose/compose';
import moment from 'moment';
import { connect } from 'react-redux';
import SubscriptionAvatar from '@/components/subscription-avatar';
import { withNamespaces } from 'react-i18next';
import classnames from 'classnames/bind';
import Icon from '@/components/icon';
import Button from '@/components/button';
import RefMessage from './ref-message';
import style from './style.css';

const cx = classnames.bind(style);

class MessageItem extends Component {
  getFileType = () => this.props.message.attachment.content_type.split('/').pop();
  getFileSizeKb = () => parseInt(this.props.message.attachment.byte_size / 1000, 10);

  renderMessageText = message => {
    let text = message.text;

    if (!text) {
      return;
    }

    if (message.mentions) {
      message.mentions.forEach(mention => {
        let link = '';

        if (mention.user_id === this.props.currentUser.id) {
          link = `<a>@${mention.text}</a>`;
        } else {
          link = `<a href="/chat/user/${mention.user_id}">@${mention.text}</a>`;
        }

        text = text.split(`@${mention.text}`).join(link);
      });
    }

    // eslint-disable-next-line no-useless-escape
    const linkreg = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;

    if (text.match(linkreg)) {
      text = text.replace(linkreg, '<a href="$1" target="_blank">$1</a>');
    }

    return text;
  };

  render() {
    const isMessageDeleted = !!this.props.message.deleted_at;
    const isMessageHasImage = this.props.message.attachment && this.props.message.attachment.content_type.match('image/');
    const isMessageHasFile = this.props.message.attachment && !isMessageHasImage;
    const isMessageCurrentUser = this.props.message.user_id === this.props.currentUser.id;
    const isMessageTextBlockShown = isMessageHasFile || this.props.message.text || this.props.message.forwarded_message_id || this.props.message.in_reply_to_message_id;

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
          <p className={style.deleted_message_text}>{this.props.t('message_has_been_deleted')}</p>
        </div>
      }

      {!isMessageDeleted &&
        <div className={style.content}>
          {isMessageTextBlockShown &&
            <div className={style.message_block}>
              {(this.props.message.in_reply_to_message_id || this.props.message.forwarded_message_id) &&
                <RefMessage
                  className={style.message}
                  {...this.props.message.forwarded_message_id ? { forwardedId: this.props.message.forwarded_message_id } : {}}
                  {...this.props.message.in_reply_to_message_id ? { repliedId: this.props.message.in_reply_to_message_id } : {}}
                />
              }

              {this.props.message.text &&
                <p className={style.text} dangerouslySetInnerHTML={{__html: this.renderMessageText(this.props.message)}} />
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

      <div className={style.info}>
        {!isMessageDeleted &&
          <span className={style.time}>{moment(this.props.message.created_at).format('HH:mm')}</span>
        }

        <SubscriptionAvatar
          userId={this.props.message.user_id}
          className={style.avatar}
        />
      </div>
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
