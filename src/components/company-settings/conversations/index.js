import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import Modal from '@/components/modal';
import Icon from '@/components/icon';
import Navigation from '@/components/navigation';
import { withRouter } from '@/hoc';
import { actions as modalActions } from '@/components/modal_container';
import style from './style.css';

class Conversations extends Component {
  close = () => this.props.pushUrl('/chat');

  openNewDialog = () => this.props.toggleModal({
    id: 'new-company-dialog-modal',

    options: {
      organization_id: parseInt(this.props.match.params.orgId, 10),
    },
  });

  render() {
    const id = parseInt(this.props.match.params.orgId, 10);
    const actions = [];

    const links = [
      {text: 'General', to: `/${id}/company-settings/general`},
      {text: 'Users', to: `/${id}/company-settings/users`},
      {text: 'Conversations', to: `/${id}/company-settings/conversations`},
    ];

    return <Modal
      title="Edit company"
      wrapClassName={style.wrapper}
      className={style.modal}
      actions={actions}
      close={this.close}
    >
      <Navigation actions={links} className={style.navigation} />

      <button type="button" className={style.new} onClick={this.openNewDialog}>
        <div className={style.circle}>
          <Icon name="plus" />
        </div>

        <p className={style.text}>New Dialog</p>
      </button>
    </Modal>;
  }
}

export default compose(
  withRouter,

  connect(
    null,

    {
      toggleModal: modalActions.toggleModal,
    },
  ),
)(Conversations);
