import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { withNamespaces } from 'react-i18next';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import classnames from 'classnames/bind';
import SubscriptionItem from '@/components/subscription-item';
import Button from '@/components/button';
import SearchInput from '@/components/search-input';
import Loading from '@/components/loading';
import Dropdown from '@/components/dropdown';
import { api } from '@';
import { withSortedSubscriptions } from '@/hoc';
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
    navigationActive: 'all',
  };

  chooseTabNavigation = tab => () => this.setState({ navigationActive: tab });
  openAddChat = () => this.props.toggleModal({ id: 'new-chat-modal' });
  openEditProfileModal = () => this.props.toggleModal({ id: 'edit-profile-modal' });
  onSearchInput = event => this.props.filterSubscription(event.target.value);

  logout = () => api.logout().then(() => {
    this.props.clearMessages();
    this.props.clearSubscriptions();
    this.props.clearUsers();
    this.props.setCurrentUser(null);
    this.props.router.push('/sign-in');
    window.localStorage.removeItem('authToken');
    window.localStorage.removeItem('currentUser');
  }).catch(error => this.props.showNotification(this.props.t(error.text)));

  async componentWillMount() {
    const shortSubscriptions = await api.getSubscriptions({ short: true });
    this.props.loadSubscriptionsIds(shortSubscriptions.subscriptions);
  }

  shouldComponentUpdate(nextProps) {
    const isSortedSubscriptionsLoaded = this.props.sorted_subscriptions_ids.length === 0 && nextProps.sorted_subscriptions_ids.length > 0;
    const isSubscriptionsChanged = !isEqual(this.props.subscriptions_list, nextProps.subscriptions_list);
    const isMessagesChanged = !isEqual(this.props.messages_list, nextProps.messages_list);
    const isFiltering = !isEqual(this.props.subscriptions_filtered_ids, nextProps.subscriptions_filtered_ids);

    return isSortedSubscriptionsLoaded || isSubscriptionsChanged || isMessagesChanged || isFiltering;
  }

  render() {
    const isChatsLoaded = this.props.subscriptions_ids.length > 0 &&
      this.props.subscriptions_ids.length === Object.keys(this.props.subscriptions_list).length;

    const photo = get(this.props.currentUser, 'avatar.small', '/assets/default-user.jpg');

    return <div className={cx('sidebar', this.props.className)}>
      <div className={style.header}>
        <h1>Unichat</h1>

        <Dropdown
          uniqueId="sidebar-user-dropdown"
          className={style.dropdown}

          items={[
            { text: this.props.t('edit_profile'), onClick: this.openEditProfileModal },
            { text: this.props.t('log_out'), onClick: this.logout },
          ]}
        >
          <button className={style.image} style={{ '--bg-image': `url(${photo})` }} />
        </Dropdown>

        <Button appearance="_fab-divider" icon="add-chat" onClick={this.openAddChat} className={style.button} />
      </div>

      <SearchInput onInput={this.onSearchInput} className={style.search} />

      <div className={style.navigation}>
        <button
          className={cx({'_is-active': this.state.navigationActive === 'all'})}
          onClick={this.chooseTabNavigation('all')}
        >All</button>

        <button
          className={cx({'_is-active': this.state.navigationActive === 'personal'})}
          onClick={this.chooseTabNavigation('personal')}
        >Personal</button>

        <button
          className={cx({'_is-active': this.state.navigationActive === 'work'})}
          onClick={this.chooseTabNavigation('work')}
        >Work</button>
      </div>

      <div className={style.list}>
        {this.props.sorted_subscriptions_ids &&
          this.props.sorted_subscriptions_ids.map(id => <SubscriptionItem
            key={id}
            id={id}
            className={style.subscription}
            withLoadData
          />)}

        {!this.props.sorted_subscriptions_ids.length === 0 &&
          <p className={style.empty}>There is no chats</p>}
      </div>

      <Loading isShown={!isChatsLoaded} className={style.loading} />
    </div>;
  }
}

export default compose(
  withRouter,
  withNamespaces('translation'),

  connect(
    state => ({
      currentUser: state.currentUser,
      subscriptions_ids: state.subscriptions.ids,
      subscriptions_list: state.subscriptions.list,
      subscriptions_filtered_ids: state.subscriptions.filtered_ids,
    }),

    {
      loadSubscriptionsIds: subscriptionsActions.loadSubscriptionsIds,
      toggleModal: modalActions.toggleModal,
      setCurrentUser: storeActions.setCurrentUser,
      showNotification: notificationActions.showNotification,
      filterSubscription: subscriptionsActions.filterSubscription,
      clearSubscriptions: subscriptionsActions.clearSubscriptions,
      clearMessages: messagesActions.clearMessages,
      clearUsers: usersActions.clearUsers,
    },
  ),

  withSortedSubscriptions(props => ({
    ids: props.subscriptions_filtered_ids,
  })),
)(Sidebar);
