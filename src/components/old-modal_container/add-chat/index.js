import React, { Component, Fragment } from 'react';
import classnames from 'classnames/bind';
import map from 'lodash/map';
import get from 'lodash/get';
import find from 'lodash/find';
import reject from 'lodash/reject';
import isEqual from 'lodash/isEqual';
import filter from 'lodash/filter';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import Loading from '@/components/loading';
import Modal from '@/components/old-modal';
import Icon from '@/components/icon';
import { api } from '@';
import { withRouter } from '@/hoc';
import { actions as usersActions } from '@/store/users';
import { actions as subscriptionsActions } from '@/store/subscriptions';
import { actions as notificationActions } from '@/components/notification';
import SearchInput from '@/components/search-input';
import Avatar from '@/components/avatar';
import style from './style.css';

const cx = classnames.bind(style);

class AddChat extends Component {
  state = {
    global: [],
    checkedUsers: [],
    isLoading: false,
    search: '',
  };

  onSearchInput = event => {
    event.persist();
    const value = event.target.value;
    this.setState({ search: value });

    if (value.length >= 5) {
      this.setState({ isLoading: true });

      api.searchUser({ nick_prefix: value }).then(data => {
        this.setState({
          global: data.users,
          isLoading: false,
        });
      }).catch(() => {
        this.props.showNotification({
          type: 'error',
          text: this.props.t('invalid_character'),
        });

        this.setState({ isLoading: false });
      });
    }
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

  clear = () => this.setState({
    global: [],
    checkedUsers: [],
    isLoading: false,
    search: '',
  });

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
    users = map(this.props.users_ids, id => this.props.users_list[id]);
    users = reject(users, { id: this.props.currentUser.id });

    users = filter(users, user => {
      const nick = user.nick || 'no nick';
      return nick.toLowerCase().startsWith(this.state.search.toLowerCase());
    });

    return users;
  };

  getGlobalContacts = localContacts => filter(this.state.global, user => !find(localContacts, { id: user.id }));

  render() {
    const localContacts = this.getLocalContacts();
    const globalContacts = this.getGlobalContacts(localContacts);

    return <Modal
      id="new-chat-modal"
      title={this.props.t('new_chat')}
      className={style.modal}
      wrapClassName={style.wrapper}
      close={this.props.close}

      actions={[
        { text: this.props.t('clear'), onClick: this.clear },
        { text: this.props.t('create'), onClick: this.create },
      ]}
    >
      <Loading type="line" className={cx('loading', {'_is-shown': this.state.isLoading})} isShown />

      <SearchInput
        value={this.state.search}
        onInput={this.onSearchInput}
        className={style.search}
      />

      <div className={style.scroll}>
        {localContacts.length === 0 && globalContacts.length === 0 &&
          <p className={style.empty}>{this.props.t('no_results')}</p>
        }

        {localContacts.length > 0 &&
          <Fragment>
            <h3 className={style.title}>{this.props.t('your_contacts')}</h3>

            {localContacts.map(user => {
              const avatar = get(user, 'avatar.small', '/assets/default-user.jpg') || '/assets/default-user.jpg';
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
          </Fragment>
        }

        {globalContacts.length > 0 &&
          <Fragment>
            <h3 className={style.title}>{this.props.t('global_search')}</h3>

            {globalContacts.map(user => {
              const avatar = get(user, 'avatar.small', '/assets/default-user.jpg') || '/assets/default-user.jpg';
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
