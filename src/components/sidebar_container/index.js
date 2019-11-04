import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import get from 'lodash/get';
import classnames from 'classnames/bind';
import Filters from './filters';
import Tasks from './tasks';
import Subscriptions from './subscriptions';
import Button from '@/components/button';
import Input from '@/components/input';
import Dropdown from '@/components/dropdown';
import { api } from '@';
import { withRouter } from '@/hoc';
import { actions as storeActions } from '@/store';
import { actions as subscriptionsActions } from '@/store/subscriptions';
import { actions as messagesActions } from '@/store/messages';
import { actions as usersActions } from '@/store/users';
import { actions as modalActions } from '@/components/modal_container';
import { actions as notificationActions } from '@/components/notification';
import style from './style.css';

const cx = classnames.bind(style);

class Sidebar extends Component {
  state = {
    isLoading: false,
  };

  openAddChat = () => {
    if (!this.props.organization) {
      this.props.toggleModal({ id: 'new-dialogue-modal' });
      return;
    }

    this.props.toggleModal({
      id: 'new-company-dialog-modal',

      options: {
        organization_id: this.props.organization.id,
      },
    });
  };

  openEditProfileModal = () => this.props.toggleModal({ id: 'edit-profile-modal' });
  onSearchInput = event => this.props.filterSubscription({ text: event.target.value });
  filterSubscriptionsByTag = tag => () => this.props.filterSubscription({ tag });
  goToSettings = () => this.props.pushUrl(`/${this.props.organization.id}/company-settings/general`);

  logout = () => api.logout().then(() => {
    this.props.clearMessages();
    this.props.clearSubscriptions();
    this.props.clearUsers();
    this.props.setCurrentUser(null);
    window.localStorage.removeItem('authToken');
    window.localStorage.removeItem('currentUser');
    this.props.pushUrl('/sign-in');
  }).catch(error => this.props.showNotification({
    type: 'error',
    text: this.props.t(error.code),
  }));

  async componentWillMount() {
    if (!this.props.currentUser) {
      return;
    }

    if (this.props.hasSubscriptions) {
      return;
    }

    try {
      this.setState({ isLoading: true });
      const response = await api.getSubscriptions();
      this.props.loadSubscriptions(response.subscriptions);
      this.setState({ isLoading: false });
    } catch (error) {
      this.setState({ isLoading: false });

      this.props.setError({
        details: error,

        request: {
          name: 'getSubscriptions',
        },
      });
    }
  }

  render() {
    const actions = [
      { text: this.props.t('edit_profile'), onClick: this.openEditProfileModal },
      { text: this.props.t('log_out'), onClick: this.logout },
    ];

    const photo = get(this.props.currentUser, 'avatar.small', '/assets/default-user.jpg');
    const userImageInline = { '--bg-image': `url(${photo})` };
    const isFiltersShown = this.props.subscriptions_filter_text;
    const isSubscriptionsShown = !this.props.subscriptions_filter_text;
    const title = this.props.organization ? this.props.organization.name : 'Unichat';

    return <div className={cx('sidebar', this.props.className)}>
      <div className={style.header}>
        <div className={style.logo}>
          <div className={style.circle} />
          <div className={style.circle} />
          <div className={style.circle} />
        </div>

        <Dropdown
          uniqueId="sidebar-user-dropdown"
          className={style.dropdown}
          items={actions}
        >
          <button className={style.image} style={userImageInline} />
        </Dropdown>

        {this.props.organization &&
          <Button appearance="_fab-divider" icon="menu" onClick={this.goToSettings} className={style.button} />
        }

        <Button appearance="_fab-divider" icon="add-chat" onClick={this.openAddChat} className={style.button} />

        {false &&
          <Tasks />
        }
      </div>

      <h1 className={style.title}>{title}</h1>

      <Input
        appearance="_border-transparent"
        icon="search"
        onInput={this.onSearchInput}
        placeholder={this.props.t('search_messages_or_contacts')}
        className={style.search}
      />

      <div className={style.list} id="sidebar-scroll">
        {isSubscriptionsShown &&
          <Subscriptions isLoading={this.state.isLoading} />
        }

        {isFiltersShown &&
          <Filters />
        }
      </div>
    </div>;
  }
}

export default compose(
  withRouter,
  withTranslation(),

  connect(
    state => ({
      currentUser: state.currentUser,
      subscriptions_filter_text: state.subscriptions.filter_text,
      hasSubscriptions: state.subscriptions.ids.length > 0,
    }),

    {
      loadSubscriptions: subscriptionsActions.loadSubscriptions,
      toggleModal: modalActions.toggleModal,
      setCurrentUser: storeActions.setCurrentUser,
      showNotification: notificationActions.showNotification,
      filterSubscription: subscriptionsActions.filterSubscription,
      clearSubscriptions: subscriptionsActions.clearSubscriptions,
      clearMessages: messagesActions.clearMessages,
      clearUsers: usersActions.clearUsers,
      setError: storeActions.setError,
    },
  ),

  connect(
    (state, props) => {
      if (!props.match.params.orgId) {
        return {};
      }

      const organization = state.organizations.list[parseInt(props.match.params.orgId, 10)];

      return {
        organization,
      };
    },
  ),
)(Sidebar);