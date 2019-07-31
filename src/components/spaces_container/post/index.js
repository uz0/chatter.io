import React, { Component } from 'react';
import map from 'lodash/map';
import filter from 'lodash/filter';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import classnames from 'classnames/bind';
import moment from 'moment';
import SubscriptionAvatar from '@/components/subscription-avatar';
import { withTranslation } from 'react-i18next';
import Button from '@/components/button';
import Icon from '@/components/icon';
import { actions as galleryActions } from '@/components/gallery_container';
import style from './style.css';

const cx = classnames.bind(style);

class Post extends Component {
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

  getFormattedDate = date => {
    const diff = moment().diff(moment(date));
    const diffInMinutes = moment.duration(diff).asMinutes();

    if (diffInMinutes < 30) {
      setTimeout(() => this.forceUpdate(), 60000);
      return `${Math.ceil(diffInMinutes)} min ago`;
    }

    if (moment(date).isSame(moment(), 'day')) {
      return `Today at ${moment(date).format('HH:mm')}`;
    }

    return moment(date).format('DD MMMM, HH:mm');
  };

  render() {
    const images = this.props.message.attachments && filter(this.props.message.attachments, attachment => attachment.content_type.match('image/')) || [];
    const imagesUrls = map(images, image => image.url);
    const files = this.props.message.attachments && filter(this.props.message.attachments, attachment => !attachment.content_type.match('image/')) || [];
    const countImages = images.length >= 5 ? 'many' : images.length;

    const username = this.props.author && this.props.author.nick || 'no nick';
    const userId = this.props.author && this.props.author.id;

    const date = this.getFormattedDate(this.props.message.created_at);

    return <div className={cx('post', this.props.className)}>
      <div className={style.header}>
        <SubscriptionAvatar userId={userId} className={style.avatar} />
        <p className={style.name}>{username}</p>
        <p className={style.caption}>{date}</p>
        <Button appearance="_icon-transparent" icon="dots" className={style.action} />
      </div>

      <div className={style.content}>
        {this.props.message.text &&
          <p className={style.text}>{this.props.message.text}</p>
        }

        {images.length > 0 &&
          <div className={cx('gallery', `count-${countImages}`)}>
            {images.map((image, index) => {
              const handleClick = () => this.props.openGallery({
                images: imagesUrls,
                index,
              });

              if (countImages === 1) {
                return <img
                  key={image.url}
                  src={image.url}
                  onClick={handleClick}
                />;
              }

              const inlineStyle = {'--image': `url(${image.url})`};

              return <div
                key={image.url}
                className={style.image}
                style={inlineStyle}
                onClick={handleClick}
              />;
            })}
          </div>
        }

        {files.length > 0 &&
          <div className={style.files}>
            {files.map(file => {
              const fileSize = this.getFileSize(file);

              return <a key={file.url} href={file.url} target="_blank" download={file.filename} className={style.file}>
                <Icon name="add-chat" />

                <div className={style.section}>
                  <p className={style.name}>File</p>

                  <div className={style.subcaption}>
                    <p className={style.text}>{file.filename}</p>
                    <span className={style.size}>{fileSize}</span>
                  </div>
                </div>
              </a>;
            })}
          </div>
        }
      </div>

      <div className={style.footer}>
        <input placeholder="Reply" className={style.reply_input} />
        <Button appearance="_icon-transparent" icon="plus" className={style.action} />
      </div>
    </div>;
  }
}

export default compose(
  withTranslation(),

  connect(
    (state, props) => ({
      message: state.messages.list[props.id],
    }),

    {
      openGallery: galleryActions.openGallery,
    },
  ),

  connect(
    (state, props) => ({
      author: state.users.list[props.message.user_id],
    }),
  ),
)(Post);
