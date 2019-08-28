import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import Modal from '@/components/old-modal';
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
        isForceToSpace: true,
      },
    );

    this.props.close();
  };

  cancel = () => this.props.close();

  render() {
    const actions = [
      {text: this.props.t('no'), onClick: this.cancel},
      {text: this.props.t('yes'), onClick: this.confirm},
    ];

    return <Modal
      id="crosspost-modal"
      title={this.props.t('cross_post')}
      className={style.modal}
      wrapClassName={style.wrapper}
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