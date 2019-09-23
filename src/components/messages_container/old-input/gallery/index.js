import React from 'react';
import { withTranslation } from 'react-i18next';
import compose from 'recompose/compose';
import Icon from '@/components/icon';
import Loading from '@/components/loading';
import classnames from 'classnames/bind';
import { getProgressText } from '@/helpers';
import style from './style.css';

const cx = classnames.bind(style);

const Gallery = ({ attachments, removeAttachment, className }) => <div className={cx('gallery', className)}>
  {attachments.map((attachment, index) => {
    const isAttachmentImage = attachment.content_type.match('image/');
    const progress = getProgressText(attachment);

    if (!isAttachmentImage) {
      return;
    }

    return <div
      key={index}
      className={style.preview}
      {...isAttachmentImage ? { style: { '--image': `url(${attachment.url})` } } : {}}
    >
      {!isAttachmentImage &&
        <Icon name="attach" />
      }

      <button onClick={removeAttachment(attachment.uid)}>
        <Icon name="close" />
      </button>

      {attachment.isLoading &&
        <p className={style.progress}>{progress}</p>
      }

      <Loading className={style.file_loading} isShown={attachment.isLoading} />
    </div>;
  })}
</div>;

export default compose(
  withTranslation(),
)(Gallery);
