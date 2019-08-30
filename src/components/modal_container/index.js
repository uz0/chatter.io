import React, { Component, Fragment } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import find from 'lodash/find';
import NewDialogue from './new-dialogue';
import EditProfile from './edit-profile';
import ChangePassword from './change-password';
import classnames from 'classnames/bind';
import modalActions from './actions';
import style from './style.css';

const cx = classnames.bind(style);

export { default as actions } from './actions';
export { default as reducers } from './reducers';

class ModalContainer extends Component {
  render() {
    const isContainerShown = find(this.props.ids, id => id.match('content-modal-'));

    return !isContainerShown ? null : <div className={cx('modal_container', this.props.className)}>
      {this.props.ids.map(id => <Fragment key={id}>
        {/*
          content-modal приставка будет пока не переделаем и удалим все старые модалки
          надо делать проверку в chat/container на то, открыты ли модалки
        */}
        {id === 'content-modal-new-dialogue-modal' && <NewDialogue options={this.props.list[id]} close={() => this.props.closeModal(id)} />}
        {id === 'content-modal-edit-profile-modal' && <EditProfile options={this.props.list[id]} close={() => this.props.closeModal(id)} />}
        {id === 'content-modal-change-profile-modal' && <ChangePassword options={this.props.list[id]} close={() => this.props.closeModal(id)} />}
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
