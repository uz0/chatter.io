import React, { Component } from 'react';
import compose from 'recompose/compose';
import { withRouter } from 'react-router';
import { withNamespaces } from 'react-i18next';
import Modal from '@/components/modal';
import { api } from '@';
import style from './style.css';

class LeaveChat extends Component {
  leave = () => api.unsubscribe({ subscription_id: this.props.options.subscription_id }).then(() => {
    this.props.close();
    this.props.router.push('/chat');
  });

  render() {
    return <Modal
      id="leave-chat"
      title={`${this.props.t('leave_group')}?`}
      wrapClassName={style.wrapper}
      className={style.modal}
      close={this.props.close}
      isActionsCenter

      actions={[
        { text: this.props.t('cancel'), onClick: this.props.close },
        { text: this.props.t('leave_group'), onClick: this.leave, isDanger: true },
      ]}
    >
      <p>{this.props.t('leave_group_text')}</p>
    </Modal>;
  }
}

export default compose(
  withRouter,
  withNamespaces('translation'),
)(LeaveChat);
