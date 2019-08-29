import React, { Component, Fragment } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import map from 'lodash/map';
import find from 'lodash/find';
import reject from 'lodash/reject';
import isEqual from 'lodash/isEqual';
import filter from 'lodash/filter';
import Modal from '@/components/modal';
import Icon from '@/components/icon';
import { api } from '@';
import { withRouter } from '@/hoc';
import { getOpponentUser } from '@/helpers';
import SubscriptionAvatar from '@/components/subscription-avatar';
import SearchInput from '@/components/search-input';
import { actions as usersActions } from '@/store/users';
import { actions as subscriptionsActions } from '@/store/subscriptions';
import { actions as notificationActions } from '@/components/notification';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

class NewDialogue extends Component {
  state = {
    search: '',
    global: [],
    checkedUsers: [],
    isLoading: false,
  };

  onSearchInput = event => {
    event.persist();
    const value = event.target.value;
    this.setState({ search: value });

    if (value.length >= 5) {
      this.searchGlobalUsers(value);
    }

    if (value.length < 5 && this.state.global.length > 0) {
      this.setState({global: []});
    }
  };

  searchGlobalUsers = value => {
    this.setState({ isLoading: true });

    api.searchUser({ nick_prefix: value }).then(data => {
      this.setState({
        global: data.users,
        isLoading: false,
      });

      this.props.addUsers(data.users);
    }).catch(() => {
      this.props.showNotification({
        type: 'error',
        text: this.props.t('invalid_character'),
      });

      this.setState({ isLoading: false });
    });
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

      const participantsWithoutYou = filter(subscription.group.participants, participant => participant.user_id !== this.props.currentUserId);

      if (isEqual(map(participantsWithoutYou, participant => participant.user_id).sort(), this.state.checkedUsers.sort())) {
        sameSubscription = subscription;
      } else if (subscription.group.name === name) {
        sameSubscription = subscription;
      }
    });

    if (sameSubscription) {
      this.props.pushUrl(`/chat/${sameSubscription.id}`);
      this.props.close();
      return;
    }

    api.createRoom({ name, user_ids: this.state.checkedUsers }).then(data => {
      this.props.pushUrl(`/chat/${data.subscription.id}`);
      this.props.close();
    }).catch(error => {
      console.error(error);

      this.props.showNotification({
        type: 'error',
        text: this.props.t(error.code),
      });
    });
  };

  createPrivateChat = () => {
    api.getPrivateSubscription({ user_id: this.state.checkedUsers[0] }).then(data => {
      if (this.props.subscriptions_ids.indexOf(data.subscription.id) === -1) {
        this.props.addUsers(data.subscription.group.participants);
        this.props.addSubscription(data.subscription);
      }

      this.props.close();
      this.props.pushUrl(`/chat/user/${this.state.checkedUsers[0]}`);
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

  getLocalContacts = () => {
    let users = [];

    this.props.subscriptions_ids.forEach(id => {
      const subscription = this.props.subscriptions_list[id];

      if (subscription.group.type !== 'private_chat') {
        return;
      }

      const opponent = getOpponentUser(subscription);

      if (opponent) {
        users.push(opponent);
      }
    });

    users = reject(users, { id: this.props.currentUserId });

    users = filter(users, user => {
      const nick = user.nick || 'no nick';
      return nick.toLowerCase().startsWith(this.state.search.toLowerCase());
    });

    return users;
  };

  getGlobalContacts = localContacts => filter(this.state.global, user => !find(localContacts, { id: user.id }));

  render() {
    const localContacts = this.getLocalContacts();
    const isLocalContactsExist = localContacts.length > 0;

    const globalContacts = this.getGlobalContacts(localContacts);
    const isGlobalContactsExist = globalContacts.length > 0;

    const checkedUsers = map(this.state.checkedUsers, id => this.props.users_list[id]);
    const isUsersChecked = checkedUsers.length > 0;

    let subcaption = '';

    if (isUsersChecked) {
      subcaption = `${checkedUsers.length} people`;
    }

    const actions = [
      {appearance: '_basic-primary', text: 'Create', onClick: this.create},
    ];

    return <Modal
      id="new-dialogue-modal"
      title="New Dialogue"
      subcaption={subcaption}
      className={style.modal}
      close={this.props.close}
      actions={actions}
    >
      <div className={style.checked_users}>
        {isUsersChecked &&
          checkedUsers.map(user => {
            const nick = user.nick || 'no nick';

            return <div className={style.user} key={user.id}>
              <div className={style.avatar_wrapper}>
                <SubscriptionAvatar userId={user.id} className={style.avatar} />

                <button className={style.delete} onClick={this.toggleUser(user.id)}>
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
        placeholder="Your contacts or global search"
        className={style.search}
      />

      <div className={style.list}>
        {isLocalContactsExist &&
          <Fragment>
            <h3 className={style.title}>Your contacts</h3>

            {localContacts.map(user => {
              const nick = user.nick || 'no nick';
              const isChecked = this.state.checkedUsers.indexOf(user.id) !== -1;

              return <button key={user.id} className={style.item} onClick={this.toggleUser(user.id)}>
                <SubscriptionAvatar userId={user.id} className={style.avatar} />
                <p className={style.name}>{nick}</p>

                <div className={cx('checkbox', {'_is-checked': isChecked})}>
                  <Icon name="mark" />
                </div>
              </button>;
            })}
          </Fragment>
        }

        {isGlobalContactsExist &&
          <Fragment>
            <h3 className={style.title}>Global search</h3>

            {globalContacts.map(user => {
              const nick = user.nick || 'no nick';
              const isChecked = this.state.checkedUsers.indexOf(user.id) !== -1;

              return <button key={user.id} className={style.item} onClick={this.toggleUser(user.id)}>
                <SubscriptionAvatar userId={user.id} className={style.avatar} />
                <p className={style.name}>{nick}</p>

                <div className={cx('checkbox', {'_is-checked': isChecked})}>
                  <Icon name="mark" />
                </div>
              </button>;
            })}
          </Fragment>
        }
      </div>
    </Modal>;
  }
}

export default compose(
  withRouter,
  withTranslation(),

  connect(
    state => ({
      currentUserId: state.currentUser.id,
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
)(NewDialogue);
