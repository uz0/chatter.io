import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import get from 'lodash/get';
import classnames from 'classnames/bind';
import Filters from './filters';
import Subscriptions from './subscriptions';
import Button from '@/components/button';
import SearchInput from '@/components/search-input';
import Dropdown from '@/components/dropdown';
import { api } from '@';
import { withRouter } from '@/hoc';
import { actions as storeActions } from '@/store';
import { actions as subscriptionsActions } from '@/store/subscriptions';
import { actions as messagesActions } from '@/store/messages';
import { actions as usersActions } from '@/store/users';
import { actions as modalActions } from '@/components/old-modal_container';
import { actions as notificationActions } from '@/components/notification';
import style from './style.css';

const cx = classnames.bind(style);

class Sidebar extends Component {
  state = {
    isLoading: false,
  };

  openAddChat = () => this.props.toggleModal({ id: 'new-chat-modal' });
  openEditProfileModal = () => this.props.toggleModal({ id: 'edit-profile-modal' });
  onSearchInput = event => this.props.filterSubscription({ text: event.target.value });
  filterSubscriptionsByTag = tag => () => this.props.filterSubscription({ tag });

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

    const isAllFilterActive = this.props.subscriptions_filter_tag === 'all';
    const isPersonalFilterActive = this.props.subscriptions_filter_tag === 'personal';
    const isWorkFilterActive = this.props.subscriptions_filter_tag === 'work';

    return <div className={cx('sidebar', this.props.className)}>
      <div className={style.header}>
        <h1>Unichat</h1>

        <Dropdown
          uniqueId="sidebar-user-dropdown"
          className={style.dropdown}
          items={actions}
        >
          <button className={style.image} style={userImageInline} />
        </Dropdown>

        <Button appearance="_fab-divider" icon="add-chat" onClick={this.openAddChat} className={style.button} />
      </div>

      <div className={style.navigation}>
        <button
          className={cx({ '_is-active': isAllFilterActive })}
          onClick={this.filterSubscriptionsByTag('all')}
        >{this.props.t('all')}</button>

        <button
          className={cx({ '_is-active': isWorkFilterActive })}
          onClick={this.filterSubscriptionsByTag('work')}
        >{this.props.t('work')}</button>

        <button
          className={cx({ '_is-active': isPersonalFilterActive })}
          onClick={this.filterSubscriptionsByTag('personal')}
        >{this.props.t('personal')}</button>
      </div>

      <SearchInput onInput={this.onSearchInput} className={style.search} />

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
      subscriptions_filter_tag: state.subscriptions.filter_tag,
      subscriptions_filter_text: state.subscriptions.filter_text,
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
)(Sidebar);