import React, { Component } from 'react';
import map from 'lodash/map';
import get from 'lodash/get';
import find from 'lodash/find';
import filter from 'lodash/filter';
import compose from 'recompose/compose';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import Modal from '@/components/modal';
import { api } from '@';
import { getOpponentUser } from '@/helpers';
import { actions as notificationActions } from '@/components/notification';
import SearchInput from '@/components/search-input';
import Avatar from '@/components/avatar';
import style from './style.css';

class Invite extends Component {
  inviteUser = user_id => () => {
    api.invite({ subscription_id: this.props.details.id, user_id })
      .then(() => this.props.close())

      .catch(error => error.text && this.props.showNotification({
        type: 'error',
        text: this.props.t(error.code),
      }));
  };

  render() {
    const subscriptions = map(this.props.subscriptions_ids, id => this.props.subscriptions_list[id]);

    const privateSubscriptions = filter(subscriptions,
      subscription => subscription && subscription.group.type === 'private_chat' &&
        subscription.group.participants.length === 2 &&
        !find(this.props.details.group.participants, { user_id: getOpponentUser(subscription).id }),
    );

    return <Modal
      id="invite-modal"
      title={this.props.t('invite')}
      wrapClassName={style.wrapper}
      className={style.modal}
      close={this.props.close}
    >
      <SearchInput
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

            return <button
              key={user.id}
              className={style.button}
              onClick={this.inviteUser(user.id)}
            >
              <Avatar photo={avatar} className={style.avatar} />
              <p className={style.name}>{nick}</p>
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
    (state, props) => ({
      subscriptions_ids: state.subscriptions.ids,
      subscriptions_list: state.subscriptions.list,
      details: state.subscriptions.list[props.options.subscription_id],
      users_list: state.users.list,
    }),

    {
      showNotification: notificationActions.showNotification,
    },
  ),
)(Invite);
