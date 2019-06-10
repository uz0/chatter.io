import React, { Component } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import { withNamespaces } from 'react-i18next';
import { Portal } from 'react-portal';
import classnames from 'classnames/bind';
import Icon from '@/components/icon';
import Button from '@/components/button';
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
    const isInfo = this.props.type === 'info';
    const isError = this.props.type === 'error';

    let title = '';
    let icon = '';

    if (isSuccess) {
      title = this.props.t('success');
      icon = 'mark';
    }

    if (isInfo) {
      title = this.props.t('info');
      icon = 'info';
    }

    if (isError) {
      title = this.props.t('error');
      icon = 'exclamation';
    }

    return this.state.isInDom && <Portal>
      <div className={style.wrapper}>
        <div
          className={cx('notification', {
            '_is-shown': this.state.isShown,
            '_is-success': isSuccess,
            '_is-info': isInfo,
            '_is-error': isError,
          })}
        >
          <div className={style.icon}>
            <Icon name={icon} />
          </div>

          <div className={style.section}>
            <h3 className={style.title}>{title}</h3>
            <p className={style.text}>{this.props.text}</p>
          </div>

          <Button
            appearance="_icon-transparent"
            icon="close"
            onClick={this.close}
            className={style.close}
          />
        </div>
      </div>
    </Portal>;
  }
}

export default compose(
  withNamespaces('translation'),

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
