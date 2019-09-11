import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import Modal from '@/components/modal';
import { api } from '@';
import { getOpponentUser } from '@/helpers';
import { withRouter } from '@/hoc';
import { actions as notificationActions } from '@/components/notification';
import style from './style.css';

class LeaveChat extends Component {
  leave = () => api.unsubscribe({ subscription_id: this.props.options.subscription_id }).then(() => {
    this.props.close();
    this.props.pushUrl('/chat');
  });

  deleteContact = () => {
    const user = getOpponentUser(this.props.details);

    if (!user) {
      return;
    }

    api.deleteContact({user_id: user.id}).then(() => {
      this.props.close();
      this.props.pushUrl('/chat');
    }).catch(error => this.props.showNotification({
      type: 'error',
      text: error.text,
    }));
  };

  render() {
    let actions = [
      {appearance: '_basic-divider', text: this.props.t('cancel'), onClick: this.props.close},
    ];

    if (this.props.details.group.type === 'private_chat') {
      actions.push({appearance: '_basic-danger', text: this.props.t('delete_contact'), onClick: this.deleteContact});
    } else {
      actions.push({appearance: '_basic-danger', text: this.props.t('leave_group'), onClick: this.leave});
    }

    const title = this.props.details.group.type === 'private_chat' ? `${this.props.t('delete_contact')}?` : `${this.props.t('leave_group')}?`;
    const text = this.props.details.group.type === 'private_chat' ? `${this.props.t('delete_contact_text')}?` : `${this.props.t('leave_group_text')}?`;

    return <Modal
      title={title}
      className={style.modal}
      close={this.props.close}
      actions={actions}
    >
      <p>{text}</p>
    </Modal>;
  }
}

export default compose(
  withRouter,
  withTranslation(),

  connect(
    (state, props) => ({
      details: state.subscriptions.list[props.options.subscription_id],
    }),

    {
      showNotification: notificationActions.showNotification,
    },
  ),
)(LeaveChat);
