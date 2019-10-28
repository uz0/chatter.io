import React, { Component } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import { withTranslation } from 'react-i18next';
import { Portal } from 'react-portal';
import classnames from 'classnames/bind';
import Icon from '@/components/icon';
import actions from './actions';
import style from './style.css';

export { default as actions } from './actions';
export { default as reducers } from './reducers';

const cx = classnames.bind(style);

class Notification extends Component {
  timeout = null;

  state = {
    isShown: false,
    isInDom: false,
  };

  open = () => {
    this.setState({
      isShown: true,
      isInDom: true,
    });

    this.timeout = setTimeout(() => this.close(), 5000);
  };

  forceOpen = () => {
    clearTimeout(this.timeout);

    this.setState({
      isShown: false,
      isInDom: false,
    }, this.open);
  };

  hideAfterAnimation = () => setTimeout(() => {
    this.setState({ isInDom: false });
    this.props.hide();
  }, 100);

  close = () => {
    clearTimeout(this.timeout);
    this.setState({ isShown: false }, this.hideAfterAnimation);
  };

  componentWillReceiveProps(nextProps) {
    if (!this.props.isShown && nextProps.isShown) {
      this.open();
    }

    if (this.props.isShown && nextProps.isShown) {
      this.forceOpen();
    }
  }

  render() {
    const isSuccess = this.props.type === 'success';

    return this.state.isInDom && <Portal>
      <button type="button" onClick={this.close} className={cx('notification', {'_is-shown': this.state.isShown})}>
        {isSuccess &&
          <Icon name="mark" className={style.mark} />
        }

        <p className={style.text}>{this.props.text}</p>
        <Icon name="close" className={style.close} />
      </button>
    </Portal>;
  }
}

export default compose(
  withTranslation(),

  connect(
    state => ({
      isShown: state.notification.isShown,
      text: state.notification.text,
      type: state.notification.type || 'info',
    }),

    {
      hide: actions.hideNotification,
    },
  ),
)(Notification);
