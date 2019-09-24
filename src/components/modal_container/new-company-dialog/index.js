import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import map from 'lodash/map';
import get from 'lodash/get';
import filter from 'lodash/filter';
import Modal from '@/components/modal';
import Loading from '@/components/loading';
import Icon from '@/components/icon';
import SubscriptionAvatar from '@/components/subscription-avatar';
import SearchInput from '@/components/search-input';
import { api } from '@';
import { actions as organizationActions } from '@/store/organizations';
import { actions as notificationActions } from '@/components/notification';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

class NewCompanyDialog extends Component {
  state = {
    isLoading: false,
    checkedUsers: [],
    search: '',
  };

  onSearchInput = event => this.setState({ search: event.target.value });

  create = async () => {
    const checkedUsers = map(this.state.checkedUsers, id => this.props.organization_users_list[id]);
    const user_ids = map(checkedUsers, 'user.id');

    let obj = {
      user_ids,
      name: '23ff',
      organization_id: this.props.options.organization_id,
      type: 'public',
    };

    try {
      await api.createOrganizationRoom(obj);
    } catch (error) {
      this.props.showNotification({
        type: 'error',
        text: error.text,
      });
    }
  };

  toggleUser = id => () => {
    const index = this.state.checkedUsers.indexOf(id);
    let array = [...this.state.checkedUsers];

    if (index === -1) {
      array.push(id);
    } else {
      array.splice(index, 1);
    }

    this.setState({ checkedUsers: array });
  };

  async componentWillMount() {
    if (this.props.organization_users_ids.length === 0) {
      this.setState({ isLoading: true });
      const { organizations_users } = await api.getOrganizationUsers({organization_id: this.props.options.organization_id});
      this.setState({ isLoading: false });
      this.props.loadOrganizationUsers(organizations_users);
    }
  }

  render() {
    const checkedUsers = map(this.state.checkedUsers, id => this.props.organization_users_list[id]);
    const isUsersChecked = checkedUsers.length > 0;

    let organizationUsers = map(this.props.organization_users_ids, id => this.props.organization_users_list[id]);
    organizationUsers = filter(organizationUsers, member => member.user.id !== this.props.currentUserId);

    organizationUsers = filter(organizationUsers, member => {
      const nick = member.user.nick || 'no nick';
      return nick.toLowerCase().startsWith(this.state.search.toLowerCase());
    });

    const isOrganizationUsersExist = organizationUsers.length > 0;

    let actions = [];

    if (isUsersChecked) {
      actions.push({appearance: '_basic-primary', text: 'Create', onClick: this.create});
    }

    return <Modal
      title="New Dialogue"
      className={style.modal}
      close={this.props.close}
      actions={actions}
    >
      {this.state.isLoading &&
        <Loading type="line" isShown className={style.loading} />
      }

      <div className={style.checked_users}>
        {isUsersChecked &&
          checkedUsers.map(member => {
            const { user } = member;
            const nick = user.nick || 'no nick';

            return <div className={style.user} key={user.id}>
              <div className={style.avatar_wrapper}>
                <SubscriptionAvatar userId={user.id} className={style.avatar} />

                <button className={style.delete} onClick={this.toggleUser(member.id)}>
                  <Icon name="close" />
                </button>
              </div>

              <p className={style.name}>{nick}</p>
            </div>;
          })
        }

        {!isUsersChecked &&
          <p className={style.subcaption}>Choose people to create dialog</p>
        }
      </div>

      <SearchInput
        onInput={this.onSearchInput}
        placeholder="Organization users"
        className={style.search}
      />

      {!isOrganizationUsersExist &&
        <p className={style.empty}>There is no users</p>
      }

      {isOrganizationUsersExist &&
        <div className={style.list}>
          <h3 className={style.title}>Organization users</h3>

          {organizationUsers.map(member => {
            const { user } = member;
            const nick = user.nick || 'no nick';
            const isChecked = this.state.checkedUsers.indexOf(member.id) !== -1;

            return <button key={user.id} className={style.item} onClick={this.toggleUser(member.id)}>
              <SubscriptionAvatar userId={user.id} className={style.avatar} />
              <p className={style.name}>{nick}</p>

              <div className={cx('checkbox', {'_is-checked': isChecked})}>
                <Icon name="mark" />
              </div>
            </button>;
          })}
        </div>
      }
    </Modal>;
  }
}

export default compose(
  connect(
    (state, props) => ({
      currentUserId: state.currentUser.id,
      organization_users_ids: get(state.organizations.list[props.options.organization_id], 'users_ids', []),
      organization_users_list: state.organizations.users.list,
    }),

    {
      showNotification: notificationActions.showNotification,
      loadOrganizationUsers: organizationActions.loadOrganizationUsers,
    },
  ),
)(NewCompanyDialog);
