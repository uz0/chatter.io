import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { withNamespaces } from 'react-i18next';
import classnames from 'classnames/bind';
import SubscriptionItem from '@/components/subscription-item';
import Button from '@/components/button';
import SearchInput from '@/components/search-input';
import Dropdown from '@/components/dropdown';
import { api } from '@';
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
  openAddChat = () => this.props.showModal('new-chat-modal');

  logout = () => api.logout().then(() => {
    this.props.clearMessages();
    this.props.clearSubscriptions();
    this.props.clearUsers();
    this.props.setCurrentUser(null);
    window.localStorage.removeItem('authToken');
    window.localStorage.removeItem('currentUser');
    this.props.router.push('/sign-in');
  }).catch(error => this.props.showNotification(this.props.t(error.text)));

  async componentWillMount() {
    const shortSubscriptions = await api.getSubscriptions({ short: true });
    this.props.loadSubscriptionsIds(shortSubscriptions.subscriptions);
  }

  render() {
    return <div className={cx('sidebar', this.props.className)}>
      <div className={style.header}>
        <h1>Unichat</h1>

        <Dropdown
          uniqueId="sidebar-user-dropdown"
          className={style.dropdown}

          items={[
            { text: this.props.t('log_out'), onClick: this.logout },
          ]}
        >
          <button className={style.image} style={{ '--bg-image': 'url(/assets/default-user.jpg)' }} />
        </Dropdown>

        <Button appearance="_fab-divider" icon="add-chat" onClick={this.openAddChat} className={style.button} />
      </div>

      <SearchInput className={style.search} />

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
        {this.props.subscriptions_ids &&
          this.props.subscriptions_ids.map(id => <SubscriptionItem
            key={id}
            id={id}
            className={style.subscription}
          />)}

        {!this.props.subscriptions_ids &&
          <p className={style.empty}>There is no chats</p>}
      </div>
    </div>;
  }
}

export default compose(
  withRouter,
  withNamespaces('translation'),

  connect(
    state => ({
      subscriptions_ids: state.subscriptions.ids,
      subscriptions_list: state.subscriptions.list,
    }),

    {
      loadSubscriptionsIds: subscriptionsActions.loadSubscriptionsIds,
      showModal: modalActions.showModal,
      setCurrentUser: storeActions.setCurrentUser,
      showNotification: notificationActions.showNotification,
      clearSubscriptions: subscriptionsActions.clearSubscriptions,
      clearMessages: messagesActions.clearMessages,
      clearUsers: usersActions.clearUsers,
    },
  ),
)(Sidebar);
