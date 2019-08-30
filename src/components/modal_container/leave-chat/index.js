import React, { Component } from 'react';
import compose from 'recompose/compose';
import { withTranslation } from 'react-i18next';
import Modal from '@/components/modal';
import { api } from '@';
import { withRouter } from '@/hoc';
import style from './style.css';

class LeaveChat extends Component {
  leave = () => api.unsubscribe({ subscription_id: this.props.options.subscription_id }).then(() => {
    this.props.close();
    this.props.pushUrl('/chat');
  });

  render() {
    return <Modal
      title={`${this.props.t('leave_group')}?`}
      className={style.modal}
      close={this.props.close}

      actions={[
        {appearance: '_basic-divider', text: this.props.t('cancel'), onClick: this.props.close},
        {appearance: '_basic-danger', text: this.props.t('leave_group'), onClick: this.leave},
      ]}
    >
      <p>{this.props.t('leave_group_text')}</p>
    </Modal>;
  }
}

export default compose(
  withRouter,
  withTranslation(),
)(LeaveChat);
