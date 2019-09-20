import React, { Component, Fragment } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import NewDialogue from './new-dialogue';
import EditProfile from './edit-profile';
import ChangePassword from './change-password';
import CrossPost from './crosspost';
import Forward from './forward';
import Invite from './invite';
import InviteCompany from './invite-company';
import LeaveChat from './leave-chat';
import NewCompanyDialog from './new-company-dialog';
import classnames from 'classnames/bind';
import modalActions from './actions';
import style from './style.css';

const cx = classnames.bind(style);

export { default as actions } from './actions';
export { default as reducers } from './reducers';

class ModalContainer extends Component {
  render() {
    const isContainerShown = this.props.ids.length > 1 || (this.props.ids.length === 1 && this.props.ids[0] !== 'panel-container');

    return !isContainerShown ? null : <div className={cx('modal_container', this.props.className)}>
      {this.props.ids.map(id => <Fragment key={id}>
        {
          /*
            content-modal приставка будет пока не переделаем и удалим все старые модалки
            надо делать проверку в chat/container на то, открыты ли модалки
          */
        }

        {id === 'new-dialogue-modal' && <NewDialogue options={this.props.list[id]} close={() => this.props.closeModal(id)} />}
        {id === 'edit-profile-modal' && <EditProfile options={this.props.list[id]} close={() => this.props.closeModal(id)} />}
        {id === 'change-profile-modal' && <ChangePassword options={this.props.list[id]} close={() => this.props.closeModal(id)} />}
        {id === 'forward-modal' && <Forward options={this.props.list[id]} close={() => this.props.closeModal(id)} />}
        {id === 'invite-modal' && <Invite options={this.props.list[id]} close={() => this.props.closeModal(id)} />}
        {id === 'leave-chat-modal' && <LeaveChat options={this.props.list[id]} close={() => this.props.closeModal(id)} />}
        {id === 'invite-company-modal' && <InviteCompany options={this.props.list[id]} close={() => this.props.closeModal(id)} />}
        {id === 'new-company-dialog-modal' && <NewCompanyDialog options={this.props.list[id]} close={() => this.props.closeModal(id)} />}

        {/* чтобы можно было добавлять crosspost-modal-1, crosspost-modal-2 и тд */}
        {id.match('crosspost-modal') && <CrossPost options={this.props.list[id]} close={() => this.props.closeModal(id)} />}
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
