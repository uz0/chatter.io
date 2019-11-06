import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import Button from '@/components/button';
import { actions as messagesActions } from '@/store/messages';
import classnames from 'classnames/bind';
import style from './style.css';

import actions from './actions';

const cx = classnames.bind(style);

class MultiplyActions extends Component {
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
    if (!this.props.isCheckShown) {
      return null;
    }

    return <div className={cx('multiply', this.props.className)}>
      <Button appearance="_basic-primary" text="Forward" className={style.button} />
      <Button appearance="_basic-primary" text="Delete" className={style.button} onClick={this.props.deleteMessages} />
      <Button appearance="_basic-divider" text="Cancel" className={style.button} onClick={this.props.resetCheckedMessages} />
    </div>;
  }
}

export default compose(
  connect(
    state => ({
      isCheckShown: state.messages.checked_ids.length > 0,
    }),

    {
      resetCheckedMessages: messagesActions.resetCheckedMessages,
      deleteMessages: actions.deleteMessages,
    },
  ),
)(MultiplyActions);
