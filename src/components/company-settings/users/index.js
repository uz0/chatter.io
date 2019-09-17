import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import Modal from '@/components/modal';
import Navigation from '@/components/navigation';
import SubscriptionAvatar from '@/components/subscription-avatar';
import Dropdown from '@/components/dropdown';
import Loading from '@/components/loading';
import Button from '@/components/button';
import { withRouter } from '@/hoc';
import { actions as modalActions } from '@/components/modal_container';
import { actions as usersActions } from '@/store/users';
import { actions as notificationActions } from '@/components/notification';
import { api } from '@';
import style from './style.css';

class Users extends Component {
  state = {
    isLoading: false,
    users: [],
  };

  close = () => this.props.pushUrl('/chat');

  openInviteModal = () => this.props.toggleModal({
    id: 'invite-company-modal',

    options: {
      subscription_id: parseInt(this.props.match.params.orgId, 10),
    },
  });

  changeRole = async (user_id, role) => {
    try {
      await api.organizationAccess({organization_id: parseInt(this.props.match.params.orgId, 10), user_id, role});
    } catch (error) {
      this.props.showNotification({
        type: 'error',
        text: error.text,
      });
    }
  };

  async componentWillMount() {
    const id = parseInt(this.props.match.params.orgId, 10);
    this.setState({ isLoading: true });
    const { users } = await api.getOrganizationUsers({organization_id: id});
    this.setState({ isLoading: false, users });
    this.props.addUsers(users);
  }

  render() {
    const id = parseInt(this.props.match.params.orgId, 10);
    const actions = [];

    const links = [
      {text: 'General', to: `/${id}/company-settings/general`},
      {text: 'Users', to: `/${id}/company-settings/users`},
      {text: 'Conversations', to: `/${id}/company-settings/conversations`},
    ];

    return <Modal
      title="Edit company"
      wrapClassName={style.wrapper}
      className={style.modal}
      actions={actions}
      close={this.close}
    >
      {this.state.isLoading &&
        <Loading isShown type="line" className={style.loading} />
      }

      <Navigation actions={links} className={style.navigation} />
      <button type="button" className={style.invite} onClick={this.openInviteModal}>Invite</button>

      <div className={style.users}>
        {this.state.users.map(user => {
          if (!user) {
            return null;
          }

          const name = user.nick || 'no nick';
          let userActions = [];

          userActions.push({text: 'Make as admin', onClick: () => this.changeRole(user.id, 'admin')});
          userActions.push({text: 'Make as r/o', onClick: () => this.changeRole(user.id, 'ro')});

          return <div key={user.id} className={style.item}>
            <SubscriptionAvatar userId={user.id} className={style.avatar} />
            <p className={style.name}>{name}</p>

            {false &&
              <p className={style.role}>admin</p>
            }

            <Dropdown
              className={style.dropdown}
              uniqueId={`${user.id}-user-dropdown`}
              items={userActions}
            >
              <Button appearance="_icon-transparent" icon="dots" className={style.button} type="button" />
            </Dropdown>
          </div>;
        })}
      </div>
    </Modal>;
  }
}

export default compose(
  withRouter,

  connect(
    null,

    {
      addUsers: usersActions.addUsers,
      toggleModal: modalActions.toggleModal,
      showNotification: notificationActions.showNotification,
    },
  ),
)(Users);
