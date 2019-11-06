import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import map from 'lodash/map';
import get from 'lodash/get';
import find from 'lodash/find';
import moment from 'moment';
import Button from '@/components/button';
import { actions as inputActions } from '@/components/messages_container/input';
import { actions as modalActions } from '@/components/modal_container';
import { actions as messagesActions } from '@/store/messages';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

class MultiplyActions extends Component {
  forward = () => {
    let object = {
      id: 'forward-modal',

      options: {
        isMultiply: true,
      },
    };

    if (this.props.organization_id) {
      object['organization_id'] = this.props.organization_id;
    }

    this.props.toggleModal(object);
  };

  componentWillReceiveProps(nextProps) {
    const isChatChanged = this.props.subscription_id !== nextProps.subscription_id;

    if (isChatChanged) {
      this.props.resetCheckedMessages();
    }
  }

  componentWillUnmount() {
    this.props.resetCheckedMessages();
  }

  render() {
    if (this.props.checked_messages.length === 0) {
      return null;
    }

    const isHasNonDeleteMessages = find(this.props.checked_messages, message => {
      const isMessageInCurrentHour = moment().diff(moment(message.created_at), 'hours') === 0;
      const isOpponentMessage = message.user_id !== this.props.currentUserId;

      return !isMessageInCurrentHour || isOpponentMessage;
    });

    return <div className={cx('multiply', this.props.className)}>
      <Button appearance="_basic-primary" text="Forward" className={style.button} onClick={this.forward} />

      {!isHasNonDeleteMessages &&
        <Button appearance="_basic-primary" text="Delete" className={style.button} onClick={this.props.deleteMessages} />
      }

      <Button appearance="_basic-divider" text="Cancel" className={style.button} onClick={this.props.resetCheckedMessages} />
    </div>;
  }
}

export default compose(
  connect(
    (state, props) => ({
      currentUserId: state.currentUser.id,
      checked_messages: map(state.messages.checked_ids, id => state.messages.list[id]),
      organization_id: get(state.subscriptions.list, `${props.subscription_id}.group.organization_id`),
    }),

    {
      resetCheckedMessages: messagesActions.resetCheckedMessages,
      toggleModal: modalActions.toggleModal,
      deleteMessages: inputActions.deleteMessages,
    },
  ),
)(MultiplyActions);
