import React, { Component } from 'react';
import classnames from 'classnames/bind';
import map from 'lodash/map';
import get from 'lodash/get';
import reject from 'lodash/reject';
import isEqual from 'lodash/isEqual';
import filter from 'lodash/filter';
import compose from 'recompose/compose';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import Loading from '@/components/loading';
import Modal from '@/components/modal';
import Icon from '@/components/icon';
import { api } from '@';
import { actions as usersActions } from '@/store/users';
import { actions as subscriptionsActions } from '@/store/subscriptions';
import { actions as notificationActions } from '@/components/notification';
import SearchInput from '@/components/search-input';
import Avatar from '@/components/avatar';
import style from './style.css';

const cx = classnames.bind(style);

class AddChat extends Component {
  state = {
    searchResults: {
      isActive: false,
      users: [],
    },

    checkedUsers: [],
    isLoading: false,
    search: '',
    tab: 'my',
  };

  search = value => {
    this.setState({ isLoading: true });

    if (this.state.tab === 'my') {
      api.searchKnown({ nick_part: value }).then(data => {
        this.setState({
          searchResults: {
            isActive: true,
            users: data.users,
          },

          isLoading: false,
        });
      }).catch(() => {
        this.props.showNotification(this.props.t('invalid_character'));
        this.setState({ isLoading: false });
      });

      return;
    }

    api.searchUser({ nick_prefix: value }).then(data => {
      this.setState({
        searchResults: {
          isActive: true,
          users: data.users,
        },

        isLoading: false,
      });
    }).catch(() => {
      this.props.showNotification(this.props.t('invalid_character'));
      this.setState({ isLoading: false });
    });
  };

  onSearchInput = event => {
    event.persist();
    this.setState({ search: event.target.value });

    if (event.target.value.length < 5) {
      this.setState({
        searchResults: {
          isActive: false,
          users: [],
        },
      });

      return;
    }

    this.search(event.target.value);
  };

  toggleUser = id => () => {
    const index = this.state.checkedUsers.indexOf(id);
    let array = this.state.checkedUsers;

    if (index === -1) {
      array.push(id);
    } else {
      array.splice(index, 1);
    }

    this.setState({ checkedUsers: array });
  };

  checkTab = tab => {
    this.setState({ tab });

    if (this.state.search.length > 4) {
      setTimeout(() => this.search(this.state.search));
    }
  }

  createGroupChat = () => {
    let sameSubscription = null;
    let name = '';

    this.state.checkedUsers.forEach(id => {
      const userName = this.props.users_list[id].nick || 'no nick';
      name += `${name.length === 0 ? '' : ', '}${userName}`;
    });

    name = `${name.substr(0, 30)}${name.length > 30 ? '...' : ''}`;

    this.props.subscriptions_ids.forEach(id => {
      const subscription = this.props.subscriptions_list[id];

      if (subscription.group.type !== 'room') {
        return;
      }

      const participantsWithoutYou = filter(subscription.group.participants, participant => participant.user_id !== this.props.currentUser.id);

      if (participantsWithoutYou.length !== this.state.checkedUsers.length) {
        return;
      }

      if (isEqual(map(participantsWithoutYou, participant => participant.user_id).sort(), this.state.checkedUsers.sort())) {
        sameSubscription = subscription;
      } else if (subscription.group.name === name) {
        sameSubscription = subscription;
      }
    });

    if (sameSubscription) {
      this.props.router.push(`/chat/${sameSubscription.id}`);
      this.props.close();
      return;
    }

    api.createRoom({ name, user_ids: this.state.checkedUsers }).then(data => {
      this.props.router.push(`/chat/${data.subscription.id}`);
      this.props.close();
    }).catch(error => {
      this.props.showNotification(this.props.t(error.code));
    });
  };

  createPrivateChat = () => {
    api.getPrivateSubscription({ user_id: this.state.checkedUsers[0] }).then(data => {
      if (this.props.subscriptions_ids.indexOf(data.subscription.id) === -1) {
        this.props.addUsers(data.subscription.group.participants);
        this.props.addSubscription(data.subscription);
      }

      this.props.close();
      this.props.router.push(`/chat/user/${this.state.checkedUsers[0]}`);
    });
  };

  create = () => {
    if (this.state.checkedUsers.length === 1) {
      this.createPrivateChat();
    }

    if (this.state.checkedUsers.length > 1) {
      this.createGroupChat();
    }
  };

  getFilteredUsers = () => {
    if (this.state.tab === 'global' && !this.state.searchResults.isActive) {
      return [];
    }

    if (this.state.searchResults.isActive) {
      return this.state.searchResults.users;
    }

    let users = [];
    users = map(this.props.users_ids, id => this.props.users_list[id]);
    users = reject(users, { id: this.props.currentUser.id });

    if (this.state.tab === 'my' && this.state.search.length < 5) {
      users = filter(users, user => {
        const nick = user.nick || 'no nick';
        return nick.toLowerCase().startsWith(this.state.search.toLowerCase());
      });
    }

    return users;
  };

  render() {
    const users = this.getFilteredUsers();

    return <Modal
      id="new-chat-modal"
      title={this.props.t('new_chat')}
      className={style.modal}
      wrapClassName={style.wrapper}
      close={this.props.close}

      actions={[
        { text: this.props.t('clear'), onClick: () => {} },
        { text: this.props.t('create'), onClick: this.create },
      ]}
    >
      <Loading type="line" className={style.loading} isShown={this.state.isLoading} />

      <SearchInput
        value={this.state.search}
        onInput={this.onSearchInput}
        className={style.search}
      />

      <nav className={style.tabs}>
        <button
          className={cx({'_is-active': this.state.tab === 'my'})}
          onClick={() => this.checkTab('my')}
        >{this.props.t('your_contacts')}</button>

        <button
          className={cx({'_is-active': this.state.tab === 'global'})}
          onClick={() => this.checkTab('global')}
        >{this.props.t('global_search')}</button>
      </nav>

      {users.length === 0 &&
        <p className={style.empty}>{this.props.t('no_results')}</p>
      }

      {users.length > 0 &&
        <div className={style.list}>
          {users.map(user => {
            const avatar = get(user, 'avatar.small', '/assets/default-user.jpg');
            const nick = user.nick || 'no nick';
            const isChecked = this.state.checkedUsers.indexOf(user.id) !== -1;

            return <button
              key={user.id}
              className={cx('button', {'_is-checked': isChecked})}
              onClick={this.toggleUser(user.id)}
            >
              <Avatar photo={avatar} className={style.avatar} />
              <p className={style.name}>{nick}</p>
              <div className={style.radio}><Icon name="mark" /></div>
            </button>;
          })}
        </div>
      }
    </Modal>;
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
      users_ids: state.users.ids,
      users_list: state.users.list,
    }),

    {
      addSubscription: subscriptionsActions.addSubscription,
      addUsers: usersActions.addUsers,
      showNotification: notificationActions.showNotification,
    },
  ),
)(AddChat);
