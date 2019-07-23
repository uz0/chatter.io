import React, { Component } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import classnames from 'classnames/bind';
import SubscriptionAvatar from '@/components/subscription-avatar';
import Icon from '@/components/icon';
import modalActions from '@/components/modal_container/actions';
import { withRouter } from '@/hoc';
import { getChatName, getChatUrl, getOpponentUser, getLastActive } from '@/helpers';
import style from './style.css';

const cx = classnames.bind(style);

class Header extends Component {
  showPanelContainer = () => this.props.toggleModal({ id: 'panel-container' });

  closeChat = () => {
    this.props.closeModal('panel-container');
    this.props.pushUrl('/chat');
  };

  getLastActive = chat => {
    if (chat.group.type !== 'private_chat') {
      return null;
    }

    const opponent = getOpponentUser(chat);

    if (!opponent) {
      return null;
    }

    const user = this.props.users_list[opponent.id];
    return getLastActive(user, () => this.forceUpdate());
  };

  resetFilters = () => {
    const chatUrl = getChatUrl(this.props.details);
    this.props.pushUrl(chatUrl);

    setTimeout(() => {
      const messageList = document.getElementById('messages-scroll');
      messageList.scrollTo(0, messageList.scrollHeight);
    });
  };

  render() {
    const name = getChatName(this.props.details);
    const count = this.props.details.group.participants.length;
    const isChatPrivate = this.props.details.group.type === 'private_chat';
    const lastActive = this.getLastActive(this.props.details);
    const { tagname } = this.props.match.params;

    return <div className={cx('header', this.props.className)}>
      <button className={style.back} onClick={this.closeChat}>
        <Icon name="arrow-left" />
      </button>

      <SubscriptionAvatar subscription={this.props.details} className={style.avatar} />

      <div className={style.section}>
        <button className={style.chatname} onClick={this.showPanelContainer}>{name}</button>

        {!isChatPrivate &&
          <p className={style.count}>{count} people</p>
        }

        {isChatPrivate &&
          <p className={style.count}>{lastActive}</p>
        }

        {tagname &&
          <div className={style.filters}>
            <p className={style.name}>Filtered by <span>#{tagname}</span></p>
            <button className={style.reset} onClick={this.resetFilters}>Reset</button>
          </div>
        }
      </div>
    </div>;
  }
}

export default compose(
  withRouter,

  connect(
    (state, props) => ({
      details: state.subscriptions.list[props.chatId],
      users_list: state.users.list,
    }),

    {
      toggleModal: modalActions.toggleModal,
      closeModal: modalActions.closeModal,
    },
  ),
)(Header);
