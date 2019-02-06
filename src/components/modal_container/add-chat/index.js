import React, { Component } from 'react';
import classnames from 'classnames/bind';
import get from 'lodash/get';
import compose from 'recompose/compose';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import Modal from '@/components/modal';
import Icon from '@/components/icon';
import { api } from '@';
import { actions as subscriptionsActions } from '@/store/subscriptions';
import { actions as notificationActions } from '@/components/notification';
import SearchInput from '@/components/search-input';
import Avatar from '@/components/avatar';
import style from './style.css';

const cx = classnames.bind(style);

class AddChat extends Component {
  state = {
    checkedUsers: [],
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
    let name = '';

    this.state.checkedUsers.forEach(id => {
      const userName = this.props.users_list[id].nick || 'no nick';
      name += `${name.length === 0 ? '' : ', '}${userName}`;
    });

    name = `${name.substr(0, 30)}${name.length > 30 ? '...' : ''}`;

    api.createRoom({ name, user_ids: this.state.checkedUsers }).then(data => {
      this.props.addSubscription(data.subscription);
      this.props.router.push(`/chat/${data.subscription.id}`);
      this.props.close();
    }).catch(error => {
      console.log(error);
      this.props.showNotification(this.props.t(error.code));
    });
  };

  createPrivateChat = () => {

  };

  create = () => {
    if (!this.state.checkedUsers.length === 0) {
      return;
    }

    if (this.state.checkedUsers.length === 1) {
      this.createPrivateChat();
      return;
    }

    this.createGroupChat();
  };

  render() {
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
      <SearchInput className={style.search} />

      {false &&
        <p className={style.empty}>{this.props.t('no_results')}</p>
      }

      {true &&
        <div className={style.list}>
          {this.props.users_ids.map(id => {
            const avatar = get(this.props.users_list[id], 'avatar.small', '/assets/default-user.jpg');
            const nick = this.props.users_list[id].nick || 'no nick';
            const isChecked = this.state.checkedUsers.indexOf(id) !== -1;

            return <button
              key={id}
              className={cx('button', {'_is-checked': isChecked})}
              onClick={this.toggleUser(id)}
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
      users_ids: state.users.ids,
      users_list: state.users.list,
    }),

    {
      addSubscription: subscriptionsActions.addSubscription,
      showNotification: notificationActions.showNotification,
    },
  ),
)(AddChat);
