import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import Modal from '@/components/modal';
import { actions as inputActions } from '@/components/messages_container/input';
import { withTranslation } from 'react-i18next';
import style from './style.css';

class CrossPost extends Component {
  confirm = () => {
    this.props.sendMessage(
      {
        ...this.props.options.message,
        subscription_id: this.props.options.subscription_id,
      },

      {
        isForceToFeed: true,
      },
    );

    this.props.close();
  };

  cancel = () => this.props.close();

  render() {
    const actions = [
      {appearance: '_basic-divider', text: this.props.t('no'), onClick: this.cancel},
      {appearance: '_basic-primary', text: this.props.t('yes'), onClick: this.confirm},
    ];

    return <Modal
      title={this.props.t('cross_post')}
      className={style.modal}
      close={this.props.close}
      actions={actions}
    >
      <p>Do you want to duplicate this message to #{this.props.options.tag}?</p>
    </Modal>;
  }
}

export default compose(
  withTranslation(),

  connect(
    null,

    {
      sendMessage: inputActions.sendMessage,
    },
  ),
)(CrossPost);