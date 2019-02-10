import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Portal } from 'react-portal';
import classnames from 'classnames';
import actions from './actions';
import style from './style.css';

export { default as actions } from './actions';
export { default as reducers } from './reducers';

class Notification extends Component {
  state = {
    isShown: false,
  };

  componentDidUpdate(prevProps) {
    if (!prevProps.notification.isShown && this.props.notification.isShown) {
      setTimeout(() => this.setState({ isShown: true }), 300);
      setTimeout(() => this.setState({ isShown: false }), 3300);
      setTimeout(() => this.props.hide(), 3600);
    }
  }

  render = () => this.props.notification.isShown && <Portal className={style.qwe}>
    <div className={style.wrapper}>
      <div className={classnames(style.notification, { '_is-shown': this.state.isShown })}>{ this.props.notification.text }</div>
    </div>
  </Portal>;
}

export default connect(
  state => ({ notification: state.notification }),

  {
    hide: actions.hideNotification,
  },
)(Notification);
