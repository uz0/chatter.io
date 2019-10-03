import React, { Component, Fragment } from 'react';
import filter from 'lodash/filter';
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
import { actions as modalActions } from '@/components/modal_container';
import style from './style.css';

const cx = classnames.bind(style);

class ModalContainer extends Component {
  render() {
    const ids = filter(this.props.ids, id => !id.startsWith('classic-'));
    const isContainerShown = ids.length > 1 || (ids.length === 1 && ids[0] !== 'panel-container');

    return !isContainerShown ? null : <div className={cx('modal_container', this.props.className)}>
      {this.props.ids.map(id => <Fragment key={id}>
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
