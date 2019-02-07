import React, { Component } from 'react';
import compose from 'recompose/compose';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import Modal from '@/components/modal';
import { withNamespaces } from 'react-i18next';
import style from './style.css';

class EditProfile extends Component {
  render() {
    return <Modal
      id="edit-profile-modal"
      title={this.props.t('edit_profile')}
      className={style.modal}
      wrapClassName={style.wrapper}
      close={this.props.close}

      actions={[
        { text: this.props.t('update'), onClick: () => {} },
      ]}
    >
      Modal
    </Modal>;
  }
}

export default compose(
  withRouter,
  withNamespaces('translation'),

  connect(
    state => ({
      // временнл
      currentUser: state.currentUser,
    }),
  ),
)(EditProfile);
