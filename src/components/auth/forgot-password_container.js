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
    const params = new URLSearchParams(window.location.search);
    const password_reset_token = params.get('password_reset_token');
    const isPasswordsEqual = password_reset_token && this.props.password.value === this.props.confirmPassword.value;

    if (password_reset_token && !isPasswordsEqual) {
      this.props.showNotification({
        type: 'info',
        text: this.props.t('passwords_not_equal'),
      });
      return;
    }

    if (password_reset_token) {
      api.resetPassword({ token: password_reset_token, password: this.props.password.value })
        .then(() => {
          this.props.formReset('forgot');

          this.props.showNotification({
            type: 'success',
            text: this.props.t('password_updated'),
          });

          this.props.pushUrl('/sign-in', null);
        })

        .catch(error => this.props.showNotification({
          type: 'error',
          text: this.props.t(error.code),
        }));
    } else {
      api.requestPasswordReset({ email: this.props.email.value })
        .then(() => {
          this.props.formReset('forgot');

          this.props.showNotification({
            type: 'success',
            text: this.props.t('check_your_email'),
          });
        })

        .catch(error => this.props.showNotification({
          type: 'error',
          text: this.props.t(error.code),
        }));
    }
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
    const isConfirmPasswordChanged = this.props.confirmPassword.value !== nextProps.confirmPassword.value;

    if (this.state.commonError && (isEmailChanged || isPasswordChanged || isConfirmPasswordChanged)) {
      this.setState({ commonError: '' });
    }
  }

  render() {
    const params = new URLSearchParams(window.location.search);
    const password_reset_token = params.get('password_reset_token');
    const submitTitle = password_reset_token ? this.props.t('change') : this.props.t('send_recovery_link');

    return <div className={style.auth}>
      {this.state.isLoading &&
        <Loading type="line" isShown className={style.loading} />
      }

      <div className={style.header}>
        <h1 className={style.title}>Unichat</h1>
        <Link to="/sign-up" className={style.link}>Sign Up</Link>
      </div>

      <div className={style.content}>
        <h3 className={style.subtitle}>Forgot password?</h3>

        <form className={style.form}>
          {!password_reset_token &&
            <Input
              appearance="_none-classic"
              type="email"
              placeholder={this.props.t('email')}
              model="forgot.email"
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
          }

          {password_reset_token &&
            <Input
              appearance="_none-classic"
              type="password"
              placeholder={this.props.t('new_password')}
              model="forgot.password"
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
          }

          {password_reset_token &&
            <Input
              appearance="_none-classic"
              type="password"
              placeholder={this.props.t('confirm_password')}
              model="forgot.confirmPassword"
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
          }

          <div className={style.actions}>
            <Button
              appearance="_basic-primary"
              text={submitTitle}
              className={style.submit}
              disabled={this.state.isLoading}
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
      email: get(state.forms, 'forgot.email', {}),
      password: get(state.forms, 'forgot.password', {}),
      confirmPassword: get(state.forms, 'forgot.confirmPassword', {}),
    }),

    {
      formReset: formActions.formReset,
      showNotification: notificationActions.showNotification,
      setCurrentUser: storeActions.setCurrentUser,
    },
  ),
)(SignIn);

