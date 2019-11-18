import React, { Component, Fragment } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import map from 'lodash/map';
import find from 'lodash/find';
import get from 'lodash/get';
import reject from 'lodash/reject';
import filter from 'lodash/filter';
import Icon from '@/components/icon';
import { api } from '@';
import SubscriptionAvatar from '@/components/subscription-avatar';
import Checkbox from '@/components/old-form/checkbox';
import Input from '@/components/input';
import Loading from '@/components/loading';
import { actions as usersActions } from '@/store/users';
import { actions as notificationActions } from '@/components/notification';
import { actions as formActions } from '@/components/old-form';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

class Members extends Component {
  state = {
    search: '',
    global: [],
    contacts: [],
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
    const index = this.props.members.value.indexOf(id);
    let array = [...this.props.members.value];

    if (index === -1) {
      array.push(id);
    } else {
      array.splice(index, 1);
    }

    this.props.formChange('new_space.members', {
      ...this.props.members,
      value: array,
    });
  };

  getLocalContacts = () => {
    let users = [...this.state.contacts];

    users = reject(users, { id: this.props.currentUserId });

    users = filter(users, user => {
      const nick = user.nick || 'no nick';
      return nick.toLowerCase().startsWith(this.state.search.toLowerCase());
    });

    return users;
  };

  getGlobalContacts = localContacts => filter(this.state.global, user => !find(localContacts, { id: user.id }));

  componentWillMount() {
    this.props.formChange('new_space.members', {
      error: '',
      value: [],
      isTouched: false,
      isBlured: false,
      isRequired: true,
    });
  }

  async componentDidMount() {
    const response = await api.getContacts();
    let contacts = map(response.contacts, 'user');
    contacts = filter(contacts, item => !!item);
    this.setState({ contacts });
    this.props.addUsers(contacts);
  }

  render() {
    const localContacts = this.getLocalContacts();
    const isLocalContactsExist = localContacts.length > 0;

    const globalContacts = this.getGlobalContacts(localContacts);
    const isGlobalContactsExist = globalContacts.length > 0;

    const captionText = this.props.isPrivate.value ? 'Only invited members will see this space' : 'All members of the company will see this space';

    return <div className={cx('members', {'_is-shown': this.props.isShown})}>
      {this.state.isLoading &&
        <Loading type="line" isShown className={style.loading} />
      }

      <div className={style.settings}>
        <h3 className={style.title}>Privacy</h3>

        <div className={style.privacy}>
          <Checkbox
            label={'Private'}
            onChange={() => {}}
            model="new_space.isPrivate"
            defaultValue={false}
          />

          <p className={style.caption}>{captionText}</p>
        </div>
      </div>

      <Input
        appearance="_border-transparent"
        onInput={this.onSearchInput}
        placeholder="Your contacts or global search"
        className={style.search}
        icon="search"
      />

      <div className={style.list}>
        {isLocalContactsExist &&
          <Fragment>
            <h3 className={style.title}>Your contacts</h3>

            {localContacts.map(user => {
              const nick = user.nick || 'no nick';
              const isChecked = this.props.members.value.indexOf(user.id) !== -1;

              return <button
                type="button"
                key={user.id}
                className={style.item}
                onClick={this.toggleUser(user.id)}
              >
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
              const isChecked = this.props.members.value.indexOf(user.id) !== -1;

              return <button
                type="button"
                key={user.id}
                className={style.item}
                onClick={this.toggleUser(user.id)}
              >
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
    </div>;
  }
}

export default compose(
  withTranslation(),

  connect(
    state => ({
      currentUserId: state.currentUser.id,
      subscriptions_ids: state.subscriptions.ids,
      subscriptions_list: state.subscriptions.list,
      users_list: state.users.list,

      members: get(state.forms, 'new_space.members', {
        error: '',
        value: [],
        isTouched: false,
        isBlured: false,
        isRequired: true,
      }),

      isPrivate: get(state.forms, 'new_space.isPrivate', {
        error: '',
        value: false,
        isTouched: false,
        isBlured: false,
        isRequired: true,
      }),
    }),

    {
      formChange: formActions.formChange,
      addUsers: usersActions.addUsers,
      showNotification: notificationActions.showNotification,
    },
  ),
)(Members);
