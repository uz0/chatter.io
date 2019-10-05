import React, { Component, Fragment } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import filter from 'lodash/filter';
import find from 'lodash/find';
import isEmpty from 'lodash/isEmpty';
import moment from 'moment';
import RefMessage from '../ref-message';
import Username from '../username';
import { withTranslation } from 'react-i18next';
import classnames from 'classnames/bind';
import Icon from '@/components/icon';
import { withRouter } from '@/hoc';
import { getOpponentUser } from '@/helpers';
import style from './style.css';

const cx = classnames.bind(style);
const linkreg = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
const tagreg = /\B\#\w\w+\b/gim;

class MessageBlock extends Component {
  state = {
    audioId: null,
  };

  player = null;

  getFileName = file => {
    if (!file) {
      return null;
    }

    const lastIndex = file.url.lastIndexOf('/');
    return file.url.substring(lastIndex + 1);
  };

  getFileSize = file => {
    if (!file) {
      return null;
    }

    let formattedSize = '';
    let type = '';

    if (file.byte_size < 1024) {
      type = this.props.t('b');
      formattedSize = file.byte_size;
    }

    if (file.byte_size >= 1024 && file.byte_size < 1048576) {
      type = this.props.t('kb');
      formattedSize = Math.ceil(file.byte_size / 1024);
    }

    if (file.byte_size >= 1048576) {
      type = this.props.t('mb');
      formattedSize = Math.ceil(file.byte_size / 1048576);
    }

    return `${formattedSize} ${type}`;
  };

  renderMessageText = message => {
    let text = message.text;

    if (!text) {
      return;
    }

    if (!text.replace(/\s/g, '').length) {
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

    if (text.match(linkreg)) {
      text = text.replace(linkreg, '<a href="$1" target="_blank">$1</a>');
    }

    if (text.match(tagreg)) {
      let href = '';

      if (this.props.details.group.type === 'private_chat' && !isEmpty(getOpponentUser(this.props.details))) {
        href = `/chat/user/${getOpponentUser(this.props.details).id}`;
      } else {
        href = `/chat/${this.props.details.id}`;
      }

      text = text.replace(tagreg, tag => `<a href="${href}/tag/${tag.replace('#', '')}">${tag}</a>`);
    }

    return text;
  };

  onMessageClick = event => {
    const targetLink = event.target.closest('a');

    if (!targetLink) {
      return;
    }

    if (targetLink.getAttribute('target')) {
      return;
    }

    event.preventDefault();
    let href = targetLink.href;

    if (href.indexOf(location.origin) !== -1) {
      href = href.replace(location.origin, '');
    }

    this.props.pushUrl(href);
  };

  playAudio = audio => () => {
    this.player = new Audio(audio.url);
    this.player.play();
    this.player.addEventListener('ended', () => this.setState({ audioId: null }));

    this.setState({
      audioId: audio.url,
    });
  }

  stopAudio = () => () => {
    this.player.pause();
    this.setState({
      audioId: null,
    });
  }

  render() {
    const files = this.props.message.attachments && filter(this.props.message.attachments, attachment => !attachment.content_type.match('image/'));
    const messageText = this.renderMessageText(this.props.message);
    const isMessageCurrentUser = this.props.currentUser && this.props.message.user_id === this.props.currentUser.id;
    const isRefMessageShown = this.props.message.in_reply_to_message_id || this.props.message.forwarded_message_id;
    const editedDate = this.props.message.edited_at && moment(this.props.message.edited_at).format('HH:mm');

    const isUserNameShown = this.props.details.group.type === 'room' &&
      (this.props.type === 'first' || this.props.type === 'single') &&
      this.props.message.user_id !== this.props.currentUser.id;

    return <div
      ref={this.props.ref}
      onClick={this.props.onClick}

      className={cx(
        'message_block',
        this.props.className,

        {
          'current-user': isMessageCurrentUser,
          'opponent-user': !isMessageCurrentUser,
        },
      )}
    >
      {isUserNameShown &&
        <Username className={style.username} message={this.props.message} />
      }

      {isRefMessageShown &&
        <RefMessage
          className={style.message}
          {...this.props.message.forwarded_message_id ? { forwardedId: this.props.message.forwarded_message_id } : {}}
          {...this.props.message.in_reply_to_message_id ? { repliedId: this.props.message.in_reply_to_message_id } : {}}
        />
      }

      {messageText &&
        <p className={style.text} dangerouslySetInnerHTML={{__html: messageText}} onClick={this.onMessageClick} />
      }

      {files &&
        <Fragment>
          {files.filter(file => !file.content_type.includes('audio')).map(file => {
            const fileSize = this.getFileSize(file);

            return (
              <a key={file.url} href={file.url} target="_blank" download={file.filename} className={style.file}>
                <Icon name="add-chat" />

                <div className={style.section}>
                  <p className={style.name}>File</p>

                  <div className={style.subcaption}>
                    <p className={style.text}>{file.filename}</p>
                    <span className={style.size}>{fileSize}</span>
                  </div>
                </div>
              </a>
            );
          })}

          {files.filter(file => file.content_type.includes('audio')).map(file => {
            const isPlayed = file.url === this.state.audioId;

            return (
              <div key={file.url} className={style.file}>
                <div className={style.section}>
                  <p className={style.name}>Audio</p>
                  <div className={style.subcaption}>
                    {!isPlayed &&
                      <span
                        className={style.text}
                        onClick={this.playAudio(file)}
                      >
                        PLAY
                      </span>
                    }

                    {isPlayed &&
                      <span
                        className={style.text}
                        onClick={this.stopAudio(file)}
                      >
                        STOP
                      </span>
                    }
                  </div>
                </div>
              </div>
            );
          })}
        </Fragment>
      }

      {editedDate &&
        <p className={style.edited}>edited at {editedDate}</p>
      }
    </div>;
  }
}

export default compose(
  withRouter,
  withTranslation(),

  connect(
    (state, props) => ({
      currentUser: state.currentUser,
      message: find(state.messages.list, { uid: props.uid }),
      details: state.subscriptions.list[props.chatId],
      isMobile: state.device === 'touch',
    }),
  ),
)(MessageBlock);
