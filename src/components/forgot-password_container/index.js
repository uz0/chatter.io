import React, { Component } from 'react';
import { connect } from 'react-redux';
import Link from '@/components/link';
import compose from 'recompose/compose';

import { withTranslation } from 'react-i18next';
import { api } from '@';
import { withRouter } from '@/hoc';
import { actions as formActions } from '@/components/form';
import { actions as notificationActions } from '@/components/notification';
import { actions as storeActions } from '@/store';
import Form from '@/components/form/form';
import Input from '@/components/form/input';
import Validators from '@/components/form/validators';

import style from './style.css';

class ForgotPassword extends Component {
  state = {
    commonError: {},
    isLoading: false,
  };

  submit = event => {
    event.preventDefault();
    const params = new URLSearchParams(window.location.search);
    const password_reset_token = params.get('password_reset_token');
    const isPasswordsEqual = password_reset_token && this.props.formData.password.value === this.props.formData.confirmPassword.value;

    if (password_reset_token && !isPasswordsEqual) {
      this.props.showNotification({
        type: 'info',
        text: this.props.t('passwords_not_equal'),
      });
      return;
    }

    if (password_reset_token) {
      api.resetPassword({ token: password_reset_token, password: this.props.formData.password.value })
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
      api.requestPasswordReset({ email: this.props.formData.email.value })
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
  }

  componentWillMount() {
    if (this.props.currentUser) {
      this.props.pushUrl('/chat', null);
      return;
    }
  }

  render = () => {
    const params = new URLSearchParams(window.location.search);
    const password_reset_token = params.get('password_reset_token');
    let actions = [];

    if (password_reset_token) {
      actions.push({ text: `${this.props.t('change')}`, appearance: '_basic-primary', onClick: this.submit, type: 'submit' });
    } else {
      actions.push({ text: `${this.props.t('send_recovery_link')}`, appearance: '_basic-primary', onClick: this.submit, type: 'submit' });
    }

    return <div className={style.forgot}>
      <Link to="/" className={style.logo}>Unichat</Link>
      <h1 className={style.title}>{this.props.t('forgot_password')}?</h1>

      <Form
        actions={actions}
        error={this.state.commonError.text || ''}
        model="forgot"
        disabled={this.state.isLoading}
        className={style.form}
      >
        {!password_reset_token &&
          <Input
            appearance="_none-classic"
            type="email"
            placeholder={this.props.t('email')}
            model="forgot.email"
            disabled={this.state.isLoading}
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
      </Form>
    </div>;
  }
}

export default compose(
  withRouter,
  withTranslation(),

  connect(
    state => ({
      formData: state.forms.forgot,
      currentUser: state.currentUser,
    }),

    {
      formReset: formActions.formReset,
      showNotification: notificationActions.showNotification,
      setCurrentUser: storeActions.setCurrentUser,
    },
  ),
)(ForgotPassword);