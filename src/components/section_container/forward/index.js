import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import map from 'lodash/map';
import filter from 'lodash/filter';
import Modal from '@/components/section-modal';
import SubscriptionItem from '@/components/subscription-item';
import { getChatUrl } from '@/helpers';
import { withRouter, withSortedSubscriptions } from '@/hoc';
import { actions as inputActions } from '@/components/messages_container/input';
import { actions as messagesActions } from '@/store/messages';
import { actions as notificationActions } from '@/components/notification';
import { withTranslation } from 'react-i18next';
import style from './style.css';

class Forward extends Component {
  state = {
    isLoading: false,
  };

  forward = subscription => {
    this.setState({ isLoading: true });
    const href = getChatUrl(subscription);
    const subscription_id = subscription.id;

    let object = {
      subscription_id,

      callback: () => {
        this.setState({ isLoading: false });
        this.props.close();
        this.props.pushUrl(href);
      },
    };

    if (this.props.options && this.props.options.isMultiply) {
      object['isMultiply'] = true;
    }

    this.props.forward(object);
  };

  render() {
    return <Modal
      title={this.props.t('forward')}
      className={style.modal}
      close={this.props.close}
      isLoading={this.state.isLoading}
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
      forward: inputActions.forward,
      showNotification: notificationActions.showNotification,
    },
  ),

  withSortedSubscriptions(props => {
    let ids = map(props.subscriptions_ids, id => props.subscriptions_list[id]);

    if (props.options && props.options.organization_id) {
      ids = filter(ids, item => item.group.organization_id === props.options.organization_id);
    }

    ids = map(ids, 'id');

    return {
      ids,
    };
  }),
)(Forward);
