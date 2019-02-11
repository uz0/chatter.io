import React, { Component } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import { withRouter } from 'react-router';
import classnames from 'classnames/bind';
import SubscriptionAvatar from '@/components/subscription-avatar';
import Icon from '@/components/icon';
import { actions as modalActions} from '@/components/modal_container';
import { getChatName } from '@/helpers';
import style from './style.css';

const cx = classnames.bind(style);

class Header extends Component {
  showPanelContainer = () => this.props.toggleModal({ id: 'panel-container' });

  closeChat = () => {
    this.props.closeModal('panel-container');
    this.props.router.push('/chat');
  };

  render() {
    const name = getChatName(this.props.details);
    const count = this.props.details.group.participants.length;

    return <div className={cx('header', this.props.className)}>
      <button className={style.back} onClick={this.closeChat}>
        <Icon name="arrow-left" />
      </button>

      <SubscriptionAvatar subscription={this.props.details} className={style.avatar} />

      <div className={style.section}>
        <button onClick={this.showPanelContainer}>{name}</button>
        <p className={style.count}>{count} people</p>
      </div>
    </div>;
  }
}

export default compose(
  withRouter,

  connect(
    null,

    {
      toggleModal: modalActions.toggleModal,
      closeModal: modalActions.closeModal,
    },
  ),
)(Header);
