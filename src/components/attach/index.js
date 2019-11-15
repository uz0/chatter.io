import React, { Component, Fragment } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import find from 'lodash/find';
import findIndex from 'lodash/findIndex';
import filter from 'lodash/filter';
import CRC32 from 'crc-32';
import Recorder from 'opus-recorder';
import { uid } from '@/helpers';
import { api } from '@';
import { actions as notificationActions } from '@/components/notification';
import inputActions from '@/components/messages_container/input/actions';
import style from './style.css';

const bytesSize = 1048576;

export const recordStatuses = {
  IDDLE: 'iddle',
  TRANSCRIPT: 'transcript',
  RECORD: 'record',
  DISABLED: 'disabled',
};

const RECORD_NAME = '__record';

function captureMicrophone(errorCallback) {
  return navigator.mediaDevices
    .getUserMedia({ audio: true })
    .catch(errorCallback);
}

class Attach extends Component {
  state = {
    attachments: this.props.defaultValue ? this.props.defaultValue : [],
    recordStatus: recordStatuses.IDDLE,
  };

  getTranscript = async upload_id => {
    const wait = time => new Promise(resolve => setTimeout(() => resolve(), time));
    const {result: {status, transcript}} = await api.voiceRecognitionResult({ upload_id });

    if (status === 'completed') {
      return transcript;
    }

    if (status === 'failed') {
      return null;
    }

    await wait(500);
    return this.getTranscript(upload_id);
  };

  startRecord = async () => {
    if (!Recorder.isRecordingSupported()) {
      console.log('Recording is not support');
      return;
    }

    const microphone = await captureMicrophone(() => {
      this.setState({ recordStatus: recordStatuses.DISABLED });

      this.props.showNotification({
        type: 'error',
        text: 'Unable to access your microphone',
      });
    });

    if (!microphone) {
      return;
    }

    console.log('microphone', microphone);

    const config = {
      monitorGain: 0,
      recordingGain: 1,
      numberOfChannels: 1,
      encoderSampleRate: 24000,
      originalSampleRateOverride: 16000,
      encoderPath: 'assets/encoderWorker.min.js',
    };

    this.recorder = new Recorder(config);
    this.recorder.start();
    this.microphone = microphone;
    this.setState({ recordStatus: recordStatuses.RECORD });

    this.timeout = setTimeout(() => {
      if (this.state.recordStatus === recordStatuses.RECORD) {
        this.stopRecord();
      }
    }, 60000);

    this.recorder.onstart = () => {
      console.log('start record');
    };

    this.recorder.onstop = () => {
      console.log('stop record');
    };

    this.recorder.ondataavailable = async typedArray => {
      const dataBlob = new Blob([typedArray], { type: 'audio/ogg' });
      dataBlob.name = RECORD_NAME;

      const requestData = new FormData();
      requestData.append('file', dataBlob);
      requestData.append('encoding', 'OGG_OPUS');
      requestData.append('rate_hertz', 24000);
      requestData.append('audio_channels', 1);

      const attachment = {
        uid: uid(),
        byte_size: dataBlob.size,
        content_type: dataBlob.type,
        file_name: RECORD_NAME,
        preview: '',
        url: '',
        upload_id: null,
        isLoading: true,
      };

      this.loadFileByChunks(dataBlob, attachment.uid);
      this.setState({ attachments: [attachment] });
      console.log('this.recorder.blob', attachment);
    };
  };

  stopRecord = async () => {
    this.recorder.stop();

    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  };

  resetAttachment = () => {
    const input = document.getElementById(this.props.uniqueId);
    input.value = '';
    this.setState({ attachments: [] });
  };

  getBlobBase = blob => new Promise(resolve => {
    const reader = new FileReader();

    reader.onloadend = event => {
      let binaryString = '';
      const bytes = new Uint8Array(event.target.result);

      for (let i = 0; i < bytes.byteLength; i++) {
        binaryString += String.fromCharCode(bytes[i]);
      }

      resolve(window.btoa(binaryString));
    };

    reader.readAsArrayBuffer(blob);
  });

  getFileChecksum = file => new Promise(resolve => {
    const reader = new FileReader();

    reader.onloadend = event => {
      const bytes = new Uint8Array(event.target.result);
      resolve(CRC32.buf(bytes) >>> 0);
    };

    reader.readAsArrayBuffer(file);
  });

  onAttachFileChange = event => this.attachFiles(event.target.files);

  attachFiles = files => {
    let isSizeValid = true;

    [].forEach.call(files, file => {
      if (file.size > 209715200) {
        isSizeValid = false;
      }
    });

    if (!isSizeValid) {
      this.props.showNotification({
        type: 'info',

        text: this.props.t(
          'validation_max_size',

          {
            object: this.props.t('file'),
            count: 200,
            size_type: this.props.t('mb').toLowerCase(),
          },
        ),
      });

      return;
    }

    let attachments = [];

    [].forEach.call(files, file => {
      attachments.push({
        uid: uid(),
        byte_size: file.size,
        content_type: file.type,
        file_name: file.name,
        preview: '',
        url: '',
        upload_id: null,
        isLoading: true,
      });
    });

    this.setState({ attachments });

    [].forEach.call(files, (file, index) => {
      const attachment = attachments[index];
      setTimeout(() => this.loadFileByChunks(file, attachment.uid));
      const reader = new FileReader();

      reader.onloadend = () => {
        attachments[index].preview = reader.result;
        attachments[index].url = reader.result;
        this.setState({ attachments });
      };

      reader.readAsDataURL(file);
    });

    const input = document.getElementById(this.props.uniqueId);
    input.value = '';
  };

  updateAttachmentState = (uid, data) => {
    let attachments = this.state.attachments;
    const index = findIndex(attachments, { uid });

    if (index === -1) {
      return;
    }

    attachments[index] = {
      ...attachments[index],
      ...data,
    };

    let isLoaded = true;

    attachments.forEach(attachment => {
      if (attachment.byte_size !== attachment.currentChunk) {
        isLoaded = false;
      }
    });

    if (this.props.onChange && isLoaded) {
      this.props.onChange(attachments);
    }

    this.setState({ attachments });
  };

  loadFileByChunks = async (file, uid) => {
    try {
      if (file.size <= bytesSize) {
        await this.loadFullFile(file, uid);
        return;
      }

      await this.loadMainPartFile(file, uid);
    } catch (error) {
      console.error(error);

      this.props.showNotification({
        type: 'error',
        text: error.text,
      });

      this.resetAttachment();
    }
  };

  loadFullFile = async (file, uid) => {
    const chunk = await this.getBlobBase(file);
    const checksum = await this.getFileChecksum(file);

    let object = {
      chunk_id: 0,
      async: true,
      file_chunk: chunk,
      upload_id: null,
      file_size: file.size,
      file_checksum: checksum,
      file_name: file.name,
      content_type: file.type,
    };
    
    if (file.type === 'audio/ogg') {
      object.voice_recognition = true;
      object.subscription_id = this.props.subscription_id;
    }

    const response = await api.attachmentByChunks({
      chunk_id: 0,
      async: true,
      file_chunk: chunk,
      upload_id: null,
      file_size: file.size,
      file_checksum: checksum,
      file_name: file.name,
      content_type: file.type,
    });

    if (file.type === 'audio/ogg') {
      this.setState({ recordStatus: recordStatuses.TRANSCRIPT });
      await api.voiceRecognition({ upload_id: response.upload_id });
      const transcript = await this.getTranscript(response.upload_id);
      this.setState({recordStatus: recordStatuses.IDDLE});

      if (transcript) {
        this.props.setText(transcript);
      }
    }

    this.updateAttachmentState(uid, {
      currentChunk: file.size,
      isLoading: false,
      upload_id: response.upload_id,
    });
  };

  loadMainPartFile = async (file, uid) => {
    let attachment = find(this.state.attachments, { uid });
    let blob = file.slice(0, bytesSize);
    let chunk = await this.getBlobBase(blob);
    let chunk_id = 1;
    const checksum = await this.getFileChecksum(file);

    const response = await api.attachmentByChunks({
      chunk_id: 0,
      async: true,
      file_chunk: chunk,
      upload_id: null,
      file_size: file.size,
      file_checksum: checksum,
      file_name: file.name,
    });

    attachment.currentChunk = bytesSize;
    attachment.upload_id = response.upload_id;

    if (file.size <= bytesSize) {
      attachment.isLoading = false;
    }

    this.updateAttachmentState(uid, attachment);

    if (file.size - bytesSize < bytesSize) {
      this.loadLastChunk(file, uid);
      return;
    }

    for (let i = bytesSize; i <= file.size; i += bytesSize, chunk_id++) {
      const currentStateAttachment = find(this.state.attachments, { uid });

      if (!currentStateAttachment) {
        break;
      }

      attachment.currentChunk = i;
      this.updateAttachmentState(uid, attachment);

      blob = file.slice(i, i + bytesSize);
      chunk = await this.getBlobBase(blob);

      await api.attachmentByChunks({
        chunk_id,
        async: true,
        file_chunk: chunk,
        upload_id: response.upload_id,
        file_size: file.size,
        file_checksum: checksum,
        file_name: file.name,
      });
    }

    const rest = file.size - attachment.currentChunk + bytesSize;

    if (rest > 0 && rest < bytesSize) {
      this.loadLastChunk(file, uid, chunk_id + 1);
      return;
    }

    attachment.currentChunk = file.size;
    attachment.isLoading = false;
    this.updateAttachmentState(uid, attachment);
  };

  loadLastChunk = async (file, uid, chunk_id) => {
    const currentStateAttachment = find(this.state.attachments, { uid });

    if (!currentStateAttachment) {
      return;
    }

    const blob = file.slice(currentStateAttachment.currentChunk, file.size);
    const chunk = await this.getBlobBase(blob);
    const checksum = await this.getFileChecksum(file);

    await api.attachmentByChunks({
      chunk_id,
      async: true,
      file_chunk: chunk,
      upload_id: currentStateAttachment.upload_id,
      file_size: file.size,
      file_checksum: checksum,
      file_name: file.name,
    });

    this.updateAttachmentState(uid, {
      currentChunk: file.size,
      isLoading: false,
    });
  };

  removeAttachment = uid => () => {
    let attachments = [...this.state.attachments];
    const index = findIndex(attachments, { uid });

    if (index !== -1) {
      attachments.splice(index, 1);
    }

    if (this.props.onChange) {
      this.props.onChange(attachments);
    }

    this.setState({ attachments });
  };

  async componentWillMount() {
    await captureMicrophone(() => {
      this.setState({ recordStatus: recordStatuses.DISABLED });
    });
  }

  render() {
    const images = this.state.attachments && filter(this.state.attachments, attachment => attachment.content_type.match('image/')) || [];
    const files = this.state.attachments && filter(this.state.attachments, attachment => !attachment.content_type.match('image/')) || [];

    return <Fragment>
      <input
        id={this.props.uniqueId}
        className={style.attach_input}
        type="file"
        ref={node => this.attachInputRef = node}
        onChange={this.onAttachFileChange}
        multiple
      />

      {this.props.children && this.props.children({
        files,
        images,
        removeAttachment: this.removeAttachment,
        startRecord: this.startRecord,
        stopRecord: this.stopRecord,
        recordStatus: this.state.recordStatus,
      })}
    </Fragment>;
  }
}

export default compose(
  withTranslation(),

  connect(
    null,

    {
      setText: inputActions.setText,
      showNotification: notificationActions.showNotification,
    },
  ),
)(Attach);
