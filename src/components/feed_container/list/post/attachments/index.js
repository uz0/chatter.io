import React, { Component, Fragment } from 'react';
import compose from 'recompose/compose';
import filter from 'lodash/filter';
import map from 'lodash/map';
import get from 'lodash/get';
import find from 'lodash/find';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import classnames from 'classnames/bind';
import Icon from '@/components/icon';
import { actions as galleryActions } from '@/components/gallery_container';
import style from './style.css';

const cx = classnames.bind(style);

class Attachments extends Component {
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

  render() {
    const images = this.props.attachments && filter(this.props.attachments, attachment => attachment.content_type.match('image/')) || [];
    const imagesUrls = map(images, image => image.url);
    const files = this.props.attachments && filter(this.props.attachments, attachment => !attachment.content_type.match('image/')) || [];
    const countImages = images.length >= 5 ? 'many' : images.length;

    return this.props.attachments.length === 0 ? null : <Fragment>
      {images.length > 0 &&
        <div className={cx('gallery', this.props.galleryClassName, `count-${countImages}`)}>
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
        <div className={cx('files', this.props.filesClassName)}>
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
    </Fragment>;
  }
}

export default compose(
  withTranslation(),

  connect(
    (state, props) => ({
      attachments: get(find(state.messages.list, { uid: props.uid }), 'attachments', []),
    }),

    {
      openGallery: galleryActions.openGallery,
    },
  ),
)(Attachments);

