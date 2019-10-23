import React, { Component, Fragment } from 'react';
import { Portal } from 'react-portal';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import EditTask from './edit-task';
import modalActions from './actions';

export { default as actions } from './actions';
export { default as reducers } from './reducers';

class ModalContainer extends Component {
  closeModal = id => () => this.props.closeModal(id);

  render() {
    return <Portal>
      {this.props.ids.map(id => <Fragment key={id}>
        {id === 'classic-edit-task-modal' && <EditTask options={this.props.list[id]} close={this.closeModal(id)} />}
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
