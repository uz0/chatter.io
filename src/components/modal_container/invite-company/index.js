import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import map from 'lodash/map';
import filter from 'lodash/filter';
import Modal from '@/components/modal';
import Loading from '@/components/loading';
import SearchInput from '@/components/search-input';
import SubscriptionAvatar from '@/components/subscription-avatar';
import { api } from '@';
import { actions as usersActions } from '@/store/users';
import { actions as notificationActions } from '@/components/notification';
import style from './style.css';

class InviteCompany extends Component {
  state = {
    isLoading: false,
    contacts: [],
    search: '',
  };

  invite = id => async () => {
    try {
      await api.organizationInvite({organization_id: this.props.options.subscription_id, user_id: id});
      this.props.close();
    } catch (error) {
      this.props.showNotification({
        type: 'error',
        text: error.text,
      });
    }
  };

  onSearchInput = event => this.setState({ search: event.target.value });

  async componentWillMount() {
    this.setState({ isLoading: true });
    let { contacts } =  await api.getContacts();
    contacts = map(contacts, 'user');
    this.setState({ isLoading: false, contacts });
    this.props.addUsers(contacts);
  }

  render() {
    let contacts = this.state.contacts;

    contacts = filter(contacts, user => {
      if (!user) {
        return false;
      }

      const nick = user.nick || 'no nick';
      return nick.toLowerCase().startsWith(this.state.search.toLowerCase());
    });

    return <Modal
      title="Invite"
      className={style.modal}
      close={this.props.close}
    >
      {this.state.isLoading &&
        <Loading isShown type="line" className={style.loading} />
      }

      <SearchInput
        placeholder="Search contacts"
        className={style.search}
        onInput={this.onSearchInput}
      />

      <div className={style.users}>
        {contacts.map(contact => {
          if (!contact) {
            return null;
          }

          const nick = contact.nick || 'no nick';

          return <button key={contact.id} type="button" className={style.person} onClick={this.invite(contact.id)}>
            <SubscriptionAvatar userId={contact.id} className={style.avatar} />
            <p className={style.name}>{nick}</p>
          </button>;
        })}
      </div>
    </Modal>;
  }
}

export default compose(
  connect(
    null,

    {
      addUsers: usersActions.addUsers,
      showNotification: notificationActions.showNotification,
    },
  ),
)(InviteCompany);
