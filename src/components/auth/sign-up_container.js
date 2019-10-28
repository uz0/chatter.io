import React, { Component } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import get from 'lodash/get';
import Link from '@/components/link';
import Button from '@/components/button';
import Validators from '@/components/form/validators';
import Input from '@/components/form/input';
import { withTranslation } from 'react-i18next';
import { actions as notificationActions } from '@/components/notification';
import { actions as formActions } from '@/components/form';
import { actions as storeActions } from '@/store';
import { api } from '@';
import { withRouter } from '@/hoc';
import style from './style.css';

class SignUp extends Component {
  state = {
    commonError: '',
    isLoading: false,
  };

  login = () => api.login({
    email: this.props.email.value,
    password: this.props.password.value,
  }).then(data => {
    console.log('data', data);
    this.setState({ isLoading: false });
    this.props.formReset('register');
    this.props.setCurrentUser(data.user);
    window.localStorage.setItem('authToken', data.user.auth_token);
    window.localStorage.setItem('currentUser', JSON.stringify(data.user));

    this.props.showNotification({
      type: 'success',
      text: this.props.t('registered_success'),
    });

    this.props.pushUrl('/chat');
  }).catch(error => {
    this.setState({ commonError: this.props.t(error.code), isLoading: false });

    this.props.showNotification({
      type: 'error',
      text: this.props.t(error.code),
    });
  });

  submit = event => {
    event.preventDefault();
    this.setState({ isLoading: true });

    if (this.props.password.value !== this.props.confirmPassword.value) {
      this.setState({ commonError: {text: this.props.t('passwords_not_equal')}, isLoading: false });

      this.props.showNotification({
        type: 'info',
        text: this.props.t('passwords_not_equal'),
      });

      return;
    }

    api.register({
      email: this.props.email.value,
      password: this.props.password.value,
    }).then(() => this.login()).catch(error => {
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

    if (this.state.commonError || this.props.email.error || this.props.password.error || this.props.confirmPassword.error) {
      return true;
    }

    if (!this.props.email.value || !this.props.password.value || !this.props.confirmPassword.value) {
      return true;
    }

    return false;
  };

  componentWillMount() {
    if (this.props.currentUser) {
      this.props.router.push('/');
      return;
    }
  }

  componentWillReceiveProps(nextProps) {
    const isEmailChanged = this.props.email.value !== nextProps.email.value;
    const isPasswordChanged = this.props.password.value !== nextProps.password.value;
    const isConfirmPasswordChanged = this.props.confirmPassword.value !== nextProps.confirmPassword.value;

    if (this.state.commonError && (isEmailChanged || isPasswordChanged || isConfirmPasswordChanged)) {
      this.setState({ commonError: '' });
    }
  }

  render() {
    const isSubmitDisabled = this.isSubmitDisabled();

    return <div className={style.auth}>
      <div className={style.header}>
        <h1 className={style.title}>Unichat</h1>
        <Link to="/sign-in" className={style.link}>Log in</Link>
      </div>

      <div className={style.content}>
        <h3 className={style.subtitle}>Get started</h3>

        <form className={style.form}>
          <Input
            appearance="_none-classic"
            type="email"
            placeholder={this.props.t('email')}
            model="register.email"
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
            model="register.password"
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

          <Input
            appearance="_none-classic"
            type="password"
            placeholder={this.props.t('repeat_password')}
            model="register.confirmPassword"
            disabled={this.state.isLoading}
            error={this.state.commonError}
            className={style.input}

            validations={[
              {
                action: Validators.required,
                text: this.props.t('validation_correct', { field: this.props.t('password') }),
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
              text="Sign Up"
              className={style.submit}
              disabled={isSubmitDisabled}
              onClick={this.submit}
            />
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
      email: get(state.forms, 'register.email', {}),
      password: get(state.forms, 'register.password', {}),
      confirmPassword: get(state.forms, 'register.confirmPassword', {}),
    }),

    {
      formReset: formActions.formReset,
      showNotification: notificationActions.showNotification,
      setCurrentUser: storeActions.setCurrentUser,
    },
  ),
)(SignUp);
