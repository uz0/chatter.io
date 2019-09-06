import React from 'react';
import { withTranslation } from 'react-i18next';
import compose from 'recompose/compose';
import Icon from '@/components/icon';
import Loading from '@/components/loading';
import classnames from 'classnames/bind';
import { getProgressText } from '@/helpers';
import style from './style.css';

const cx = classnames.bind(style);

const Files = ({ attachments, removeAttachment, className }) => <div className={cx('files', className)}>
  {attachments.map((attachment, index) => {
    const isAttachmentImage = attachment.content_type.match('image/');
    const isLoading = attachment.currentChunk < attachment.byte_size;
    const progress = getProgressText(attachment);

    if (isAttachmentImage) {
      return;
    }

    return <div className={style.file_item} key={index}>
      {isLoading &&
        <Loading className={style.file_loading} isShown />
      }

      {!isLoading &&
        <Icon name="file" />
      }

      <p className={style.title}>{attachment.file_name}</p>
      <span className={style.size}>{progress}</span>

      <button className={style.delete} onClick={removeAttachment(attachment.uid)}>
        <Icon name="close" />
      </button>
    </div>;
  })}
</div>;

export default compose(
  withTranslation(),
)(Files);
