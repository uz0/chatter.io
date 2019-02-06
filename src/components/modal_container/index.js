import React, { Component, Fragment } from 'react';
import { Portal } from 'react-portal';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import AddChat from './add-chat';
import modalActions from './actions';

export { default as actions } from './actions';
export { default as reducers } from './reducers';

class ModalContainer extends Component {
  render() {
    return <Portal>
      {this.props.modal_ids.map(id => <Fragment key={id}>
        {id === 'new-chat-modal' && <AddChat close={() => this.props.closeModal(id)} />}
      </Fragment>)}
    </Portal>;
  }
}

export default compose(
  connect(
    state => ({
      modal_ids: state.modal_ids,
    }),

    {
      closeModal: modalActions.closeModal,
    },
  ),
)(ModalContainer);
