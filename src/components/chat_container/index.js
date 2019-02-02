import React, { Component } from 'react';
import compose from 'recompose/compose';
import { withNamespaces } from 'react-i18next';
import Sidebar from '@/components/sidebar_container';
import Messages from '@/components/messages_container';
import Panel from '@/components/panel_container';
import { api } from '@';
import style from './style.css';

class Chat extends Component {
  handleDocumentKeyDown = event => {
    const isChatOpen = this.props.params.chatId || this.props.params.userId;

    if (isChatOpen && event.keyCode === 27) {
      this.props.router.push('/chat');
    }
  };

  componentWillMount() {
    if (!localStorage.getItem('authToken')) {
      this.props.router.push('/sign-in');
      return;
    }
  }

  componentDidMount() {
    api.localInterface.onNotificationReceived = data => {
      console.log(data);
    };

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
        <Messages params={this.props.params} className={style.messages} />}

      {isChatOpen &&
        <Panel isShown={false} onClose={() => {}} className={style.panel} />}
    </div>;
  }
}

export default compose(
  withNamespaces('translation'),
)(Chat);
