import React, { Component, Fragment } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import get from 'lodash/get';
import filter from 'lodash/filter';
import map from 'lodash/map';
import sortBy from 'lodash/sortBy';
import moment from 'moment';
import Loading from '@/components/loading';
import Icon from '@/components/icon';
import Attach from '@/components/attach';
import { getProgressText } from '@/helpers';
import style from './style.css';

class Attachments extends Component {
  getGroupedMessages = () => {
    let messages = map(this.props.messages, id => this.props.messages_list[id]);
    messages = filter(messages, message => !message.xtag);
    messages = filter(messages, message => !message.deleted_at);
    messages = filter(messages, message => !message.in_reply_to_message_id);
    messages = filter(messages, message => !message.forwarded_message_id);
    messages = sortBy(messages, message => moment(message.created_at)).reverse();

    return messages;
  };

  shouldComponentUpdate(nextProps) {
    const isMessagesCountChanged = this.props.messages.length !== nextProps.messages.length;
    return isMessagesCountChanged;
  }

  render() {
    const groupedMessages = this.getGroupedMessages();
    const lastMessage = groupedMessages[0];

    return <Attach
      key={lastMessage ? lastMessage.id : 0}
      uniqueId={this.props.uniqueId}
      onChange={this.props.onChange}
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

                const styleObject = { '--image': `url(${image.preview})` };
                const progress = getProgressText(image);

                return <div
                  key={image.uid}
                  style={styleObject}
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
    (state, props) => ({
      messages: get(state.messages, `chatIds.${props.details_id}.list`, []),
      messages_list: state.messages.list,
    }),
  ),
)(Attachments);
