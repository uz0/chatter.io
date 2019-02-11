import React, { Component, Fragment } from 'react';
import { Portal } from 'react-portal';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import AddChat from './add-chat';
import EditProfile from './edit-profile';
import Forward from './forward';
import Invite from './invite';
import modalActions from './actions';

export { default as actions } from './actions';
export { default as reducers } from './reducers';

class ModalContainer extends Component {
  render() {
    return <Portal>
      {this.props.modal.ids.map(id => <Fragment key={id}>
        {id === 'new-chat-modal' && <AddChat options={this.props.modal.list[id]} close={() => this.props.closeModal(id)} />}
        {id === 'edit-profile-modal' && <EditProfile options={this.props.modal.list[id]} close={() => this.props.closeModal(id)} />}
        {id === 'forward-modal' && <Forward options={this.props.modal.list[id]} close={() => this.props.closeModal(id)} />}
        {id === 'invite-modal' && <Invite options={this.props.modal.list[id]} close={() => this.props.closeModal(id)} />}
      </Fragment>)}
    </Portal>;
  }
}

export default compose(
  connect(
    state => ({
      modal: state.modal,
    }),

    {
      closeModal: modalActions.closeModal,
    },
  ),
)(ModalContainer);
