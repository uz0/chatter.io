import React, { Component } from 'react';
import compose from 'recompose/compose';
import isEmpty from 'lodash/isEmpty';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import Modal from '@/components/modal';
import SubscriptionItem from '@/components/subscription-item';
import { api } from '@';
import { uid, getOpponentUser } from '@/helpers';
import { withSortedSubscriptions  } from '@/hoc';
import { actions as messagesActions } from '@/store/messages';
import { actions as notificationActions } from '@/components/notification';
import { withNamespaces } from 'react-i18next';
import style from './style.css';

class Forward extends Component {
  forward = subscription => {
    let href = '';

    if (subscription.group.type === 'private_chat' && !isEmpty(getOpponentUser(subscription))) {
      href = `/chat/user/${getOpponentUser(subscription).id}`;
    } else {
      href = `/chat/${subscription.id}`;
    }

    api.post({
      uid: uid(),
      subscription_id: subscription.id,
      text: '',
      forwarded_message_id: this.props.forward_message_id,
    }).then(data => {
      api.updateSubscription({
        subscription_id: subscription.id,
        last_read_message_id: data.message.id,
        draft: '',
      });

      this.props.clearForwardMessage();
      this.props.close();
      this.props.router.push(href);
    }).catch(error => this.props.showNotification({
      type: 'error',
      text: this.props.t(error.code),
    }));
  };

  render() {
    return <Modal
      id="forward-modal"
      title={this.props.t('forward')}
      className={style.modal}
      close={this.props.close}
    >
      {this.props.sorted_subscriptions_ids.map(id => <SubscriptionItem
        key={id}
        id={id}
        className={style.subscription}
        onClick={this.forward}
      />)}
    </Modal>;
  }
}

export default compose(
  withRouter,
  withNamespaces('translation'),

  connect(
    state => ({
      subscriptions_ids: state.subscriptions.ids,
      forward_message_id: state.messages.forward_message_id,
    }),

    {
      clearForwardMessage: messagesActions.clearForwardMessage,
      showNotification: notificationActions.showNotification,
    },
  ),

  withSortedSubscriptions(props => ({
    ids: props.subscriptions_ids,
  })),
)(Forward);
