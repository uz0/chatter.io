import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import classnames from 'classnames/bind';
import Button from '@/components/button';
import Icon from '@/components/icon';
import Validators from '@/components/form/validators';
import throttle from 'lodash/throttle';
import inputActions from './actions';
import { actions as notificationActions } from '@/components/notification';
import style from './style.css';

const cx = classnames.bind(style);

class MessageInput extends Component {
  state = {
    attachment: null,
    value: '',
  };

  onTextareaKeyDown = event => {
    if (event.keyCode === 13) {
      event.preventDefault();
    }
  };

  handleDocumentKeyDown = event => {
    if (event.keyCode === 13 && event.shiftKey && document.activeElement === this.textareaRef) {
      const selection = this.textareaRef.selectionStart;
      const newValue = this.state.value.substring(0, selection) + '\n' + this.state.value.substring(selection, this.state.value.length);
      this.setState({ value: newValue });
      this.calcTextareaHeight();
      setTimeout(() => this.textareaRef.setSelectionRange(selection + 1, selection + 1));
    }

    if (event.keyCode === 13 && !event.shiftKey && document.activeElement === this.textareaRef) {
      this.onSendButtonClick();
    }
  };

  attachFile = () => this.attachInputRef.click();

  resetAttachment = () => {
    this.attachInputRef.value = '';
    this.setState({ attachment: null });
  };

  onAttachFileChange = event => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    if (Validators.fileMaxSize(200000)(file)) {
      this.props.showNotification(this.props.t('validation_max_size', {
        object: this.props.t('file'),
        size_type: this.props.t('kb'),
        count: 200,
      }));

      this.resetAttachment();
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      this.setState({
        attachment: {
          byte_size: file.size,
          content_type: file.type,
          preview: reader.result,
          url: reader.result,
        },
      });
    };

    reader.readAsDataURL(file);
  };

  onSendButtonClick = () => {
    const text = this.state.value;
    const attachment = this.state.attachment;

    if (!text && !attachment) {
      this.props.showNotification('No data to send');
      return;
    }

    this.props.sendMessage({
      ...text ? {text} : {},
      ...attachment ? {attachment} : {},
      subscription_id: this.props.subscription_id,
    });

    this.setState({ value: '', attachment: null });
  };

  calcTextareaHeight = () => {
    this.textareaRef.style.height = '20px';

    if (this.textareaRef.scrollHeight > 20) {
      this.textareaRef.style.height = this.textareaRef.scrollHeight + 10 + 'px';
      this.inputWrapperRef.style.marginTop =  '10px';
    } else {
      this.inputWrapperRef.style.marginTop =  0;
    }
  };

  isSendButtonShown = () => {
    if (this.state.value) {
      return true;
    }

    if (this.state.attachment) {
      return true;
    }

    return false;
  };

  updateDraft = value => this.props.updateDraft({ id: this.props.subscription_id, value });
  throttleUpdateDraft = throttle(this.updateDraft, 500);

  onInput = event => {
    this.calcTextareaHeight();
    this.setState({ value: event.target.value });
    setTimeout(() => this.throttleUpdateDraft(this.state.value));
  };

  componentDidMount() {
    window.addEventListener('keydown', this.handleDocumentKeyDown);
  }

  componwntWillUnmount() {
    document.removeEventListener('keydown', this.handleDocumentKeyDown);
  }

  render() {
    const isSendButtonShown = this.isSendButtonShown();
    const isAttachmentImage = this.state.attachment && this.state.attachment.content_type.match('image/');

    return <div className={cx('input', this.props.className)}>
      <Button appearance="_icon-transparent" icon="attach" onClick={this.attachFile} className={style.attach} />

      <input
        className={style.attach_input}
        type="file"
        ref={node => this.attachInputRef = node}
        onChange={this.onAttachFileChange}
      />

      <div className={style.section}>
        {false &&
          <div className={style.message}>
            <div className={style.message_content}>
              <p className={style.name}>Alexander Borodich</p>
              <p className={style.text}>Перевод utn, выставление счета, подпись дока</p>
            </div>

            <Button appearance="_icon-transparent" icon="close" className={style.close} />
          </div>
        }

        {this.state.attachment &&
          <div
            className={style.preview}
            {...isAttachmentImage ? { style: {'--image': `url(${this.state.attachment.preview})`} } : {}}
          >
            {!isAttachmentImage &&
              <Icon name="attach" />
            }

            <button onClick={this.resetAttachment}>
              <Icon name="close" />
            </button>
          </div>
        }

        <div className={style.input_wrapper} ref={node => this.inputWrapperRef = node}>
          <textarea
            placeholder={this.props.t('message')}
            ref={node => this.textareaRef = node}
            value={this.state.value}
            onInput={this.onInput}
            onChange={() => {}}
            onKeyDown={this.onTextareaKeyDown}
          />

          <button onClick={this.onSendButtonClick} className={cx({'_is-shown': isSendButtonShown})}>Send</button>
        </div>
      </div>
    </div>;
  }
}

export default compose(
  withNamespaces('translation'),

  connect(
    null,

    {
      updateDraft: inputActions.updateDraft,
      sendMessage: inputActions.sendMessage,
      showNotification: notificationActions.showNotification,
    },
  ),
)(MessageInput);
