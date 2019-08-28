import React, { Component } from 'react';
import compose from 'recompose/compose';
import { withTranslation } from 'react-i18next';
import Modal from '@/components/modal';
import style from './style.css';

class NewDialogue extends Component {
  render() {
    return <Modal
      id="new-dialogue-modal"
      title="New Dialogue"
      className={style.modal}
      close={this.props.close}
    >
      <p>Modal</p>
    </Modal>;
  }
}

export default compose(
  withTranslation(),
)(NewDialogue);
