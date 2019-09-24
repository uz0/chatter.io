import React, { Component } from 'react';
import get from 'lodash/get';
import find from 'lodash/find';
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
import { actions as organizationsActions } from '@/store/organizations';
import { actions as notificationActions } from '@/components/notification';
import { api } from '@';
import style from './style.css';

class Users extends Component {
  state = {
    isLoading: false,
  };

  close = () => this.props.pushUrl(`/${parseInt(this.props.match.params.orgId, 10)}/chat`);

  openInviteModal = () => this.props.toggleModal({
    id: 'invite-company-modal',

    options: {
      subscription_id: parseInt(this.props.match.params.orgId, 10),
    },
  });

  changeRole = async (user_id, role) => {
    try {
      await api.organizationAccess({organization_id: parseInt(this.props.match.params.orgId, 10), user_id, role});
      const orgUser = find(this.props.organization_users_list, contact => contact.user_id === user_id);

      this.props.updateOrganizationUser({
        id: orgUser.id,
        role,
      });
    } catch (error) {
      this.props.showNotification({
        type: 'error',
        text: error.text,
      });
    }
  };

  kickUser = async user_id => {
    const organization_id = parseInt(this.props.match.params.orgId, 10);

    try {
      await api.organization_kick({organization_id, user_id});
      const member = find(this.props.organization_users_list, user => user.user_id === user_id);
      this.props.deleteOrganizationUser({organization_id, member_id: member.id});
    } catch (error) {
      this.props.showNotification({
        type: 'error',
        text: error.text,
      });
    }
  };

  async componentWillMount() {
    if (this.props.organization_users_ids.length === 0) {
      const organization_id = parseInt(this.props.match.params.orgId, 10);
      this.setState({ isLoading: true });
      const { organizations_users } = await api.getOrganizationUsers({organization_id});
      this.setState({ isLoading: false });
      this.props.loadOrganizationUsers(organizations_users);
    }
  }

  render() {
    const isUsersExist = this.props.organization_users_ids.length > 0;
    const organization_id = parseInt(this.props.match.params.orgId, 10);
    const actions = [];

    const links = [
      {text: 'General', to: `/${organization_id}/company-settings/general`},
      {text: 'Users', to: `/${organization_id}/company-settings/users`},
      {text: 'Conversations', to: `/${organization_id}/company-settings/conversations`},
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

      {isUsersExist &&
        <div className={style.users}>
          {this.props.organization_users_ids.map(id => {
            const contact = this.props.organization_users_list[id];

            if (!contact || !contact.user) {
              return null;
            }

            const { user } = contact;
            const name = user.nick || 'no nick';
            const isUserAdmin = contact.role === 'admin';

            const isCurrentUserAdmin = find(
              this.props.organization_users_list,
              contact => contact.organization_id === organization_id && contact.user_id === this.props.currentUserId && contact.role === 'admin',
            );

            let userActions = [];

            if (contact.role === 'admin') {
              userActions.push({text: 'Make as r/o', onClick: () => this.changeRole(user.id, 'ro')});
            } else {
              userActions.push({text: 'Make as admin', onClick: () => this.changeRole(user.id, 'admin')});
            }

            userActions.push({text: 'Kick', onClick: () => this.kickUser(user.id), isDanger: true});

            return <div key={user.id} className={style.item}>
              <SubscriptionAvatar userId={user.id} className={style.avatar} />
              <p className={style.name}>{name}</p>

              {isUserAdmin &&
                <p className={style.role}>admin</p>
              }

              {isCurrentUserAdmin &&
                <Dropdown
                  className={style.dropdown}
                  uniqueId={`${user.id}-user-dropdown`}
                  items={userActions}
                >
                  <Button appearance="_icon-transparent" icon="dots" className={style.button} type="button" />
                </Dropdown>
              }
            </div>;
          })}
        </div>
      }
    </Modal>;
  }
}

export default compose(
  withRouter,

  connect(
    (state, props) => ({
      currentUserId: state.currentUser.id,
      organization_users_ids: get(state.organizations.list[parseInt(props.match.params.orgId, 10)], 'users_ids', []),
      organization_users_list: state.organizations.users.list,
    }),

    {
      toggleModal: modalActions.toggleModal,
      showNotification: notificationActions.showNotification,
      loadOrganizationUsers: organizationsActions.loadOrganizationUsers,
      updateOrganizationUser: organizationsActions.updateOrganizationUser,
      deleteOrganizationUser: organizationsActions.deleteOrganizationUser,
    },
  ),
)(Users);
