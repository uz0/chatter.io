import React, { Component, Fragment } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import Loading from '@/components/loading';
import Icon from '@/components/icon';
import Attach from '@/components/attach';
import { getProgressText } from '@/helpers';
import { attachInputId } from '../../';
import actions from '../../actions';
import style from './style.css';

class Attachments extends Component {
  onAttachmentsChange = data => {
    let attachments = [];
    let upload_id = [];

    data.forEach(item => {
      attachments.push({
        byte_size: item.byte_size,
        content_type: item.content_type,
        filename: item.file_name,
        url: item.url,
      });

      upload_id.push(item.upload_id);
    });

    this.props.setAttachments({
      attachments,
      upload_id,
    });
  };

  render() {
    return <Attach
      key={0}
      uniqueId={attachInputId}
      onChange={this.onAttachmentsChange}
    >
      {({ files, images, removeAttachment }) => {
        const isImagesExist = images.length > 0;
        const isFilesExist = files.length > 0;

        return <Fragment>
          {isImagesExist &&
            <div className={style.gallery}>
              {images.map(image => {
                if (!image.preview) {
                  return;
                }

                const inline = { '--image': `url(${image.preview})` };
                const progress = getProgressText(image);

                return <div
                  key={image.uid}
                  style={inline}
                  className={style.preview}
                >
                  <button className={style.close} onClick={removeAttachment(image.uid)}>
                    <Icon name="close" />
                  </button>

                  {image.isLoading &&
                    <Fragment>
                      <p className={style.progress}>{progress}</p>
                      <Loading className={style.file_loading} isShown />
                    </Fragment>
                  }
                </div>;
              })}
            </div>
          }

          {isFilesExist &&
            <div className={style.files}>
              {files.map(file => {
                const isLoading = file.currentChunk < file.byte_size;
                const progress = getProgressText(file);

                return <div key={file.file_name} className={style.file}>
                  {isLoading &&
                    <Loading className={style.file_loading} isShown />
                  }

                  {!isLoading &&
                    <Icon name="file" />
                  }

                  <p className={style.name}>{file.file_name}</p>
                  <span className={style.size}>{progress}</span>

                  <button className={style.delete} onClick={removeAttachment(file.uid)}>
                    <Icon name="close" />
                  </button>
                </div>;
              })}
            </div>
          }
        </Fragment>;
      }}
    </Attach>;
  }
}

export default compose(
  connect(
    null,

    {
      setAttachments: actions.setAttachments,
    },
  ),
)(Attachments);
