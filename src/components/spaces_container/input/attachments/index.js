import React, { Component, Fragment } from 'react';
import Icon from '@/components/icon';
import Attach from '@/components/attach';
import style from './style.css';

class Attachments extends Component {
  render() {
    return <Attach
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

                return <div
                  key={image.uid}
                  style={styleObject}
                  className={style.preview}
                >
                  <button className={style.close} onClick={removeAttachment(image.uid)}>
                    <Icon name="close" />
                  </button>
                </div>;
              })}
            </div>
          }

          {isFilesExist &&
            <div className={style.files}>
              {files.map(file => {
                return <div key={file.file_name} className={style.file}>
                  <Icon name="file" />
                  <p className={style.name}>{file.file_name}</p>
                  <span className={style.size}>115 kb</span>

                  <button className={style.delete}>
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

export default Attachments;
