import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import map from 'lodash/map';
import filter from 'lodash/filter';
import Modal from '@/components/section-modal';
import SubscriptionItem from '@/components/subscription-item';
import { api } from '@';
import { uid, getChatUrl } from '@/helpers';
import { withRouter, withSortedSubscriptions } from '@/hoc';
import { actions as messagesActions } from '@/store/messages';
import { actions as notificationActions } from '@/components/notification';
import { withTranslation } from 'react-i18next';
import style from './style.css';

class Forward extends Component {
  forward = subscription => {
    const href = getChatUrl(subscription);
    const subscription_id = subscription.id;

    api.post({
      uid: uid(),
      subscription_id,
      text: '',
      forwarded_message_id: this.props.forward_message_id,
    }).then(data => {
      api.updateSubscription({
        subscription_id,
        last_read_message_id: data.message.id,
        draft: '',
      });

      this.props.clearForwardMessage();
      this.props.close();
      this.props.pushUrl(href);
    }).catch(error => this.props.showNotification({
      type: 'error',
      text: this.props.t(error.code),
    }));
  };

  render() {
    return <Modal
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
  withTranslation(),

  connect(
    state => {
      let subscriptions = map(state.subscriptions.ids, id => state.subscriptions.list[id]);
      subscriptions = filter(subscriptions, subscription => !subscription.is_space);

      return {
        subscriptions_ids: map(subscriptions, subscription => subscription.id),
      };
    },
  ),

  connect(
    state => ({
      subscriptions_list: state.subscriptions.list,
      forward_message_id: state.messages.forward_message_id,
    }),

    {
      clearForwardMessage: messagesActions.clearForwardMessage,
      showNotification: notificationActions.showNotification,
    },
  ),

  withSortedSubscriptions(props => {
    let ids = map(props.subscriptions_ids, id => props.subscriptions_list[id]);

    if (props.options.organization_id) {
      ids = filter(ids, item => item.group.organization_id === props.options.organization_id);
    }

    ids = map(ids, 'id');

    return {
      ids,
    };
  }),
)(Forward);
