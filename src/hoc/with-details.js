import React, { Component } from 'react';
import find from 'lodash/find';
import isEmpty from 'lodash/isEmpty';
import compose from 'recompose/compose';
import { connect } from 'react-redux';

/*
  У WrapperComponent обязательно должно быть params: { chatId, userId } в props
*/

export default WrappedComponent => {
  class Wrapped extends Component {
    getDetails = () => {
      if (isEmpty(this.props.params)) {
        return null;
      }

      if (this.props.params.chatId) {
        return this.props.subscriptions_list[this.props.params.chatId];
      }

      let details = null;

      this.props.subscriptions_ids.forEach(id => {
        const subscription = this.props.subscriptions_list[id];

        if (!subscription) {
          return;
        }

        if (subscription.group.type !== 'private_chat') {
          return;
        }

        const opponent = find(subscription.group.participants, {user_id: parseInt(this.props.params.userId, 10)});

        if (opponent) {
          details = subscription;
        }
      });

      return details;
    };

    render() {
      const details = this.getDetails();

      return <WrappedComponent details={details} {...this.props} />;
    }
  }

  return compose(
    connect(
      state => ({
        subscriptions_ids: state.subscriptions.ids,
        subscriptions_list: state.subscriptions.list,
      }),
    ),
  )(Wrapped);
};
