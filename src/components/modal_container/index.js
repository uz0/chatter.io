import React, { Component, Fragment } from 'react';
import { Portal } from 'react-portal';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import AddChat from './add-chat';
import EditProfile from './edit-profile';
import Forward from './forward';
import Invite from './invite';
import LeaveChat from './leave-chat';
import ChangePassword from './change-password';
import modalActions from './actions';

export { default as actions } from './actions';
export { default as reducers } from './reducers';

class ModalContainer extends Component {
  render() {
    return <Portal>
      {this.props.ids.map(id => <Fragment key={id}>
        {id === 'new-chat-modal' && <AddChat options={this.props.list[id]} close={() => this.props.closeModal(id)} />}
        {id === 'edit-profile-modal' && <EditProfile options={this.props.list[id]} close={() => this.props.closeModal(id)} />}
        {id === 'change-password-modal' && <ChangePassword options={this.props.list[id]} close={() => this.props.closeModal(id)} />}
        {id === 'forward-modal' && <Forward options={this.props.list[id]} close={() => this.props.closeModal(id)} />}
        {id === 'invite-modal' && <Invite options={this.props.list[id]} close={() => this.props.closeModal(id)} />}
        {id === 'leave-chat' && <LeaveChat options={this.props.list[id]} close={() => this.props.closeModal(id)} />}
      </Fragment>)}
    </Portal>;
  }
}

export default compose(
  connect(
    state => ({
      ids: state.modal.ids,
      list: state.modal.list,
    }),

    {
      closeModal: modalActions.closeModal,
    },
  ),
)(ModalContainer);
