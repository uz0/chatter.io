import React, { Component, Fragment } from 'react';
import get from 'lodash/get';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import Loading from '@/components/loading';
import Icon from '@/components/icon';
import Attach, {recordStatuses} from '@/components/attach';
import { getProgressText } from '@/helpers';
import { attachInputId } from '../../';
import actions from '../../actions';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

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
      key={this.props.lastMessageUid}
      uniqueId={attachInputId}
      onChange={this.onAttachmentsChange}
    >
      {({ files, images, removeAttachment, startRecord, stopRecord, recordStatus }) => {
        const isImagesExist = images.length > 0;
        const isFilesExist = files.length > 0;
        const isRecordStarted = recordStatus === recordStatuses.RECORD;

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

          {!isRecordStarted && !this.props.hasText &&
            <button className={style.record_button} onClick={startRecord} >
              <Icon name="microphone" />
            </button>
          }

          {isRecordStarted && !this.props.hasText &&
            <button className={cx('record_button', 'stop')} onClick={stopRecord} >
              <Icon name="stop" />
            </button>
          }
        </Fragment>;
      }}
    </Attach>;
  }
}

export default compose(
  withTranslation(),

  connect(
    (state, props) => ({
      lastMessageUid: get(state.messages, `chatIds.${props.subscription_id}.list`, [])[0],
      hasText: state.input.value.length > 0,
    }),

    {
      setAttachments: actions.setAttachments,
    },
  ),
)(Attachments);
