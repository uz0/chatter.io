import React, { Component } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import get from 'lodash/get';
import Link from '@/components/link';
import Button from '@/components/button';
import Loading from '@/components/loading';
import Validators from '@/components/form/validators';
import Input from '@/components/form/input';
import { withTranslation } from 'react-i18next';
import { actions as notificationActions } from '@/components/notification';
import { actions as formActions } from '@/components/form';
import { actions as storeActions } from '@/store';
import { api } from '@';
import { withRouter } from '@/hoc';
import style from './style.css';

class SignIn extends Component {
  state = {
    commonError: '',
    isLoading: false,
  };

  submit = event => {
    event.preventDefault();
    this.setState({ isLoading: true });

    api.login({
      email: this.props.email.value,
      password: this.props.password.value,
    }).then(data => {
      console.log('data', data);
      this.setState({ isLoading: false });
      this.props.formReset('login');
      this.props.setCurrentUser(data.user);
      window.localStorage.setItem('authToken', data.user.auth_token);
      window.localStorage.setItem('currentUser', JSON.stringify(data.user));

      this.props.showNotification({
        type: 'success',
        text: this.props.t('you_logged_success'),
      });

      this.props.pushUrl('/chat');
    }).catch(error => {
      this.setState({ commonError: this.props.t(error.code), isLoading: false });

      this.props.showNotification({
        type: 'error',
        text: this.props.t(error.code),
      });
    });
  };

  isSubmitDisabled = () => {
    if (this.state.isLoading) {
      return true;
    }

    if (this.state.commonError || this.props.email.error || this.props.password.error) {
      return true;
    }

    if (!this.props.email.value || !this.props.password.value) {
      return true;
    }

    return false;
  };

  componentWillMount() {
    if (this.props.currentUser) {
      this.props.pushUrl('/');
      return;
    }
  }

  componentWillReceiveProps(nextProps) {
    const isEmailChanged = this.props.email.value !== nextProps.email.value;
    const isPasswordChanged = this.props.password.value !== nextProps.password.value;

    if (this.state.commonError && (isEmailChanged || isPasswordChanged)) {
      this.setState({ commonError: '' });
    }
  }

  render() {
    const isSubmitDisabled = this.isSubmitDisabled();

    return <div className={style.auth}>
      {this.state.isLoading &&
        <Loading type="line" isShown className={style.loading} />
      }

      <div className={style.header}>
        <h1 className={style.title}>Unichat</h1>
        <Link to="/sign-up" className={style.link}>Sign Up</Link>
      </div>

      <div className={style.content}>
        <h3 className={style.subtitle}>Welcome back!</h3>

        <form className={style.form}>
          <Input
            appearance="_none-classic"
            type="email"
            placeholder={this.props.t('email')}
            model="login.email"
            disabled={this.state.isLoading}
            error={this.state.commonError}
            className={style.input}

            validations={[
              {
                action: Validators.required,
                text: this.props.t('validation_required', { field: this.props.t('email') }),
              },

              {
                action: Validators.email,
                text: this.props.t('validation_correct', { field: this.props.t('email') }),
              },
            ]}
          />

          <Input
            appearance="_none-classic"
            type="password"
            placeholder={this.props.t('password')}
            model="login.password"
            disabled={this.state.isLoading}
            error={this.state.commonError}
            className={style.input}

            validations={[
              {
                action: Validators.required,
                text: this.props.t('validation_required', { field: this.props.t('password') }),
              },

              {
                action: Validators.minLength(6),
                text: this.props.t('validation_min_length', { field: this.props.t('password'), count: 6 }),
              },

              {
                action: Validators.contains(' '),
                text: this.props.t('validation_contains_spaces', { field: this.props.t('password') }),
              },
            ]}
          />

          <div className={style.actions}>
            <Button
              appearance="_basic-primary"
              text="Log in"
              className={style.submit}
              disabled={isSubmitDisabled}
              onClick={this.submit}
            />

            <Link to="/forgot-password" className={style.forgot}>Forgot password?</Link>
          </div>
        </form>
      </div>

      <p className={style.copyrights}>© Unichat (Beta 1.3)</p>
    </div>;
  }
}

export default compose(
  withRouter,
  withTranslation(),

  connect(
    state => ({
      currentUser: state.currentUser,
      email: get(state.forms, 'login.email', {}),
      password: get(state.forms, 'login.password', {}),
    }),

    {
      formReset: formActions.formReset,
      showNotification: notificationActions.showNotification,
      setCurrentUser: storeActions.setCurrentUser,
    },
  ),
)(SignIn);
