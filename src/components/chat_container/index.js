import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import { withNamespaces } from 'react-i18next';
import Sidebar from '@/components/sidebar_container';
import Messages from '@/components/messages_container';
import Panel from '@/components/panel_container';
import ModalContainer from '@/components/modal_container';
import { api } from '@';
import actions from './actions';
import style from './style.css';

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

    window.addEventListener('keydown', this.handleDocumentKeyDown);
  }

  componwntWillUnmount() {
    document.removeEventListener('keydown', this.handleDocumentKeyDown);
  }

  render() {
    const isChatOpen = this.props.params.chatId || this.props.params.userId;

    return <div className={style.chat}>
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
    }),

    {
      notificationReceived: actions.notificationReceived,
    },
  ),
)(Chat);
