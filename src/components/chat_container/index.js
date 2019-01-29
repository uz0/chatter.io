import React, { Component } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
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
      <div className={style.sidebar} />

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
