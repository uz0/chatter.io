import React, { Component } from 'react';
import compose from 'recompose/compose';
import { withNamespaces } from 'react-i18next';
import Sidebar from '@/components/sidebar_container';
import Messages from '@/components/messages_container';
import Panel from '@/components/panel_container';
import style from './style.css';

class Chat extends Component {
  componentWillMount() {
    if (!localStorage.getItem('authToken')) {
      this.props.router.push('/sign-in');
      return;
    }
  }

  render() {
    return <div className={style.chat}>
      <Sidebar className={style.sidebar} />
      <Messages className={style.messages} />
      <Panel isShown={false} onClose={() => {}} className={style.panel} />
    </div>;
  }
}

export default compose(
  withNamespaces('translation'),
)(Chat);
