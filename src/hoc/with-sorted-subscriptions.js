import React, { Component } from 'react';
import moment from 'moment';
import isEqual from 'lodash/isEqual';
import compose from 'recompose/compose';
import { connect } from 'react-redux';

export default WrappedComponent => {
  class Wrapped extends Component {
    getSortedSubscriptions = () => this.props.subscriptions_ids.sort((prevId, nextId) => {
      const getSubscriptionLastMessageById = id => {
        if (!this.props.chatIds[id]) {
          return null;
        }

        const lastMessageId = this.props.chatIds[id].list[0];

        if (!lastMessageId) {
          return null;
        }

        return this.props.messages_list[lastMessageId];
      };

      const prevLastMessage = getSubscriptionLastMessageById(prevId);
      const nextLastMessage = getSubscriptionLastMessageById(nextId);

      if (!prevLastMessage && !nextLastMessage) {
        return 0;
      }

      if (!prevLastMessage) {
        return 1;
      }

      if (!nextLastMessage) {
        return -1;
      }

      if (moment(prevLastMessage.created_at).isAfter(nextLastMessage.created_at)) {
        return -1;
      }

      return 1;
    });

    shouldComponentUpdate(nextProps) {
      const isSubscriptionsIdsChanged = this.props.subscriptions_ids.length !== nextProps.subscriptions_ids.length;
      const isSubscriptionsListChanged = !isEqual(this.props.subscriptions_list, nextProps.subscriptions_list) ||
        Object.keys(this.props.subscriptions_list).length !== Object.keys(nextProps.subscriptions_list);

      return isSubscriptionsListChanged || isSubscriptionsIdsChanged;
    }

    render() {
      const sortedSubscriptions = this.getSortedSubscriptions();

      return <WrappedComponent sorted_subscriptions_ids={sortedSubscriptions} {...this.props} />;
    }
  }

  return compose(
    connect(
      state => ({
        subscriptions_ids: state.subscriptions.ids,
        subscriptions_list: state.subscriptions.list,
        chatIds: state.messages.chatIds,
        messages_list: state.messages.list,
      }),
    ),
  )(Wrapped);
};
