import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames/bind';
import compose from 'recompose/compose';
import isEqual from 'lodash/isEqual';
import { withNamespaces } from 'react-i18next';
import Sidebar from '@/components/sidebar_container';
import Messages from '@/components/messages_container';
import Panel from '@/components/panel_container';
import ModalContainer from '@/components/modal_container';
import { actions as modalActions } from '@/components/modal_container';
import { actions as messagesActions } from '@/store/messages';
import { api } from '@';
import actions from './actions';
import style from './style.css';

const cx = classnames.bind(style);

class Chat extends Component {
  handleDocumentKeyDown = event => {
    const isChatOpen = this.props.params.chatId || this.props.params.userId;

    if (isChatOpen && event.keyCode === 27) {
      this.props.router.push('/chat');
    }
  };

  componentWillMount() {
    if (!this.props.currentUser) {
      this.props.router.push('/sign-in');
      return;
    }
  }

  componentDidMount() {
    api.localInterface.onNotificationReceived = data => data.notifications.forEach(notification => {
      this.props.notificationReceived(notification);
    });

    if (Notification && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    window.addEventListener('keydown', this.handleDocumentKeyDown);
  }

  componentWillReceiveProps(nextProps) {
    const isChatExist = this.props.params.chatId || this.props.params.userId;
    const isNextPropsChatWillBeExist = nextProps.params.chatId || nextProps.params.userId;


    if (isChatExist && (!nextProps.params.chatId && !nextProps.params.userId)) {
      this.props.closeModal('panel-container');
      this.props.clearEditMessage();
      this.props.clearReplyMessage();
    }

    if (isNextPropsChatWillBeExist && !isEqual(this.props.params, nextProps.params) && !this.props.isMobile && !this.props.isPanelShown) {
      this.props.toggleModal({ id: 'panel-container' });
    }
  }

  componwntWillUnmount() {
    document.removeEventListener('keydown', this.handleDocumentKeyDown);
  }

  render() {
    const isChatOpen = this.props.params.chatId || this.props.params.userId;

    return <div className={cx('chat', {'_is-open': isChatOpen})}>
      <Sidebar className={style.sidebar} />

      {isChatOpen &&
        <Fragment>
          <Messages params={this.props.params} className={style.messages} />
          <Panel params={this.props.params} className={style.panel} />
        </Fragment>
      }

      <ModalContainer />
    </div>;
  }
}

export default compose(
  withNamespaces('translation'),

  connect(
    state => ({
      currentUser: state.currentUser,
      isMobile: state.device === 'mobile',
      isPanelShown: state.modal.ids.indexOf('panel-container') !== -1,
    }),

    {
      toggleModal: modalActions.toggleModal,
      closeModal: modalActions.closeModal,
      clearEditMessage: messagesActions.clearEditMessage,
      clearReplyMessage: messagesActions.clearReplyMessage,
      notificationReceived: actions.notificationReceived,
    },
  ),
)(Chat);
