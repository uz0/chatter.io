import React, { Component } from 'react';
import isEmpty from 'lodash/isEmpty';
import { withNamespaces } from 'react-i18next';
import compose from 'recompose/compose';
import { connect } from 'react-redux';

export default getChat => WrappedComponent => {
  class Wrapped extends Component {
    getTypings = () => {
      const props = getChat(this.props);

      if (!props.chat) {
        return null;
      }

      const chat = props.chat;

      if (isEmpty(chat.typings)) {
        return null;
      }

      const ids = Object.keys(chat.typings);

      if (ids.length > 1) {
        return `${this.props.t('several_people_typing')}...`;
      }

      const user = this.props.users_list[Number(ids[0])];

      if (!user) {
        return `no nick ${this.props.t('typing').toLowerCase()}...`;
      }

      return `${user.nick || 'no nick'} ${this.props.t('typing').toLowerCase()}...`;
    };

    render() {
      const typings = this.getTypings();

      return <WrappedComponent typings={typings} {...this.props} />;
    }
  }

  return compose(
    withNamespaces('translation'),

    connect(
      state => ({
        users_list: state.users.list,
      }),
    ),
  )(Wrapped);
};
