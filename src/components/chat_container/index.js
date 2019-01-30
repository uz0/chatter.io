import React, { Component } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import Button from '@/components/button';
// import AddChatIcon from '@/assets/icons/add-chat.svg';
import style from './style.css';

class Chat extends Component {
  componentWillMount() {
    if (!this.props.currentUser) {
      this.props.router.push('/sign-in');
      return;
    }
  }

  render() {
    return <div className={style.chat}>
      <div className={style.sidebar}>
        <div className={style.header}>
          <h1>Unichat</h1>
          <div className={style.image} style={{ '--bg-image': 'url(/assets/default-user.jpg)' }} />
          <Button appearance="_fab-divider" className={style.button} />
        </div>
      </div>

      <div className={style.content}>
        <div className={style.header} />
        <div className={style.messages} />
        <div className={style.input_container} />
      </div>

      <div className={style.panel} />
    </div>;
  }
}

export default compose(
  connect(
    state => ({
      currentUser: state.currentUser,
    }),
  ),
)(Chat);
