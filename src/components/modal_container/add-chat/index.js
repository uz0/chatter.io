import React, { Component } from 'react';
import classnames from 'classnames/bind';
import map from 'lodash/map';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import filter from 'lodash/filter';
import compose from 'recompose/compose';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import Modal from '@/components/modal';
import Icon from '@/components/icon';
import { api } from '@';
import { getOpponentUser } from '@/helpers';
import { actions as usersActions } from '@/store/users';
import { actions as subscriptionsActions } from '@/store/subscriptions';
import { actions as notificationActions } from '@/components/notification';
import SearchInput from '@/components/search-input';
import Avatar from '@/components/avatar';
import style from './style.css';

const cx = classnames.bind(style);

class AddChat extends Component {
  state = {
    checkedUsers: [],
    search: '',
  };

  onSearchInput = event => {
    event.persist();
    this.setState({ search: event.target.value });
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
      }
    });

    if (sameSubscription) {
      this.props.router.push(`/chat/${sameSubscription.id}`);
      this.props.close();
      return;
    }

    let name = '';

    this.state.checkedUsers.forEach(id => {
      const userName = this.props.users_list[id].nick || 'no nick';
      name += `${name.length === 0 ? '' : ', '}${userName}`;
    });

    name = `${name.substr(0, 30)}${name.length > 30 ? '...' : ''}`;

    api.createRoom({ name, user_ids: this.state.checkedUsers }).then(data => {
      this.props.router.push(`/chat/${data.subscription.id}`);
      this.props.close();
    }).catch(error => {
      this.props.showNotification(this.props.t(error.code));
    });
  };

  createPrivateChat = () => {
    api.addContact({
      [this.state.search.indexOf('@') !== -1 ? 'email' : 'nick']: this.state.search,
    }).then(addContactData => api.getPrivateSubscription({ user_id: addContactData.contact.user.id }).then(data => {
      if (this.props.subscriptions_ids.indexOf(data.subscription.id) === -1) {
        this.props.addUsers(data.subscription.group.participants);
        this.props.addSubscription(data.subscription);
      }

      this.props.close();
      this.props.router.push(`/chat/user/${addContactData.contact.user.id}`);
    })).catch(error => this.props.showNotification(this.props.t(error.code)));
  };

  create = () => {
    if (this.state.search) {
      this.createPrivateChat();
      return;
    }

    if (this.state.checkedUsers.length > 1) {
      this.createGroupChat();
      return;
    }
  };

  render() {
    const subscriptions = map(this.props.subscriptions_ids, id => this.props.subscriptions_list[id]);

    const privateSubscriptions = filter(subscriptions,
      subscription => subscription && subscription.group.type === 'private_chat' && subscription.group.participants.length === 2,
    );

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
      <SearchInput
        value={this.state.search}
        onInput={this.onSearchInput}
        className={style.search}
      />

      {privateSubscriptions.length === 0 &&
        <p className={style.empty}>{this.props.t('no_results')}</p>
      }

      {privateSubscriptions.length > 0 &&
        <div className={style.list}>
          {privateSubscriptions.map(subscription => {
            const user = getOpponentUser(subscription);
            const avatar = get(this.props.users_list[user.id], 'avatar.small', '/assets/default-user.jpg');
            const nick = this.props.users_list[user.id].nick || 'no nick';
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
      users_list: state.users.list,
    }),

    {
      addSubscription: subscriptionsActions.addSubscription,
      addUsers: usersActions.addUsers,
      showNotification: notificationActions.showNotification,
    },
  ),
)(AddChat);
