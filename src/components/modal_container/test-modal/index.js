import React, { Component } from 'react';
import compose from 'recompose/compose';
import { withTranslation } from 'react-i18next';
import Modal from '@/components/old-modal';
import { api } from '@';
import { withRouter } from '@/hoc';
import style from './style.css';

class Test extends Component {
  render() {
    const actions = [
      {text: this.props.t('ok'), onClick: () => {}},
    ];

    return <Modal
      id="test-modal"
      title="title"
      className={style.modal}
      close={this.props.close}
      actions={actions}
    >
      <p>Modal</p>
    </Modal>;
  }
}

export default compose(
  withTranslation(),
)(Test);
