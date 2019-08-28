import React, { Component, Fragment } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import Test from './test-modal';
import classnames from 'classnames/bind';
import modalActions from './actions';
import style from './style.css';

const cx = classnames.bind(style);

export { default as actions } from './actions';
export { default as reducers } from './reducers';

class ModalContainer extends Component {
  render() {
    return <div className={cx('modal_container', this.props.className)}>
      {this.props.ids.map(id => <Fragment key={id}>
        {id === 'test-modal' && <Test options={this.props.list[id]} close={() => this.props.closeModal(id)} />}
      </Fragment>)}
    </div>;
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
