import React, { Component, Fragment } from 'react';
import { Portal } from 'react-portal';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import Test from './test-modal';
import modalActions from './actions';

export { default as actions } from './actions';
export { default as reducers } from './reducers';

class ModalContainer extends Component {
  render() {
    return <Fragment>
      {this.props.ids.map(id => <Fragment key={id}>
        {id === 'test-modal' && <Test options={this.props.list[id]} close={() => this.props.closeModal(id)} />}
      </Fragment>)}
    </Fragment>;
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
