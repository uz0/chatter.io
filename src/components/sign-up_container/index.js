import React, { Component } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import { withNamespaces } from 'react-i18next';
import { api } from '@';
import Link from '@/components/link';
import { actions as notificationActions } from '@/components/notification';
import { actions as storeActions } from '@/store';
import { actions as formActions } from '@/components/form';
import Form from '@/components/form/form';
import { withRouter } from '@/hoc';
import Input from '@/components/form/input';
import Validators from '@/components/form/validators';

import style from './style.css';

class SignUp extends Component {
  state = {
    commonError: {},
    isLoading: false,
  };

  login = () => api.login({
    email: this.props.formData.email.value,
    password: this.props.formData.password.value,
  }).then(data => {
    console.log('data', data);
    this.setState({ isLoading: false });
    this.props.formReset('register');
    this.props.setCurrentUser(data.user);
    window.localStorage.setItem('authToken', data.user.auth_token);
    window.localStorage.setItem('currentUser', JSON.stringify(data.user));
    this.props.showNotification(this.props.t('registered_success'));
    this.props.pushUrl('/chat');
  }).catch(error => {
    this.setState({ commonError: this.props.t(error.code), isLoading: false });
    this.props.showNotification(this.props.t(error.code));
  });

  submit = event => {
    event.preventDefault();
    this.setState({ isLoading: true });

    if (this.props.formData.password.value !== this.props.formData.confirmPassword.value) {
      this.setState({ commonError: {text: this.props.t('passwords_not_equal')}, isLoading: false });
      this.props.showNotification(this.props.t('passwords_not_equal'));
      return;
    }

    api.register({
      email: this.props.formData.email.value,
      password: this.props.formData.password.value,
    }).then(() => this.login()).catch(error => {
      this.setState({ commonError: this.props.t(error.code), isLoading: false });
      this.props.showNotification(this.props.t(error.code));
    });
  }

  componentWillMount() {
    if (this.props.currentUser) {
      this.props.router.push('/');
      return;
    }
  }

  render = () => {
    return <div className={style.register}>
      <Link to="/" className={style.logo}>Chatter</Link>

      <nav>
        <Link to="/sign-in">{this.props.t('log_in')}</Link>
        <Link className={style.active_link} to="/sign-up">{this.props.t('sign_up')}</Link>
      </nav>

      <Form
        actions={[
          {text: `${this.props.t('get_started')}`, appearance: '_basic-primary', onClick: this.submit, type: 'submit'},
        ]}

        error={this.state.commonError.text || ''}
        model="register"
        disabled={this.state.isLoading}
        className={style.form}
      >
        <Input
          type="email"
          placeholder={this.props.t('email')}
          model="register.email"
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

        <Input
          type="password"
          placeholder={this.props.t('password')}
          model="register.password"
          disabled={this.state.isLoading}
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

        <Input
          type="password"
          placeholder={this.props.t('confirm_password')}
          model="register.confirmPassword"
          disabled={this.state.isLoading}
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
      </Form>
    </div>;
  }
}

export default compose(
  withRouter,
  withNamespaces('translation'),

  connect(
    state => ({
      currentUser: state.currentUser,
      formData: state.forms.register,
    }),

    {
      formReset: formActions.formReset,
      showNotification: notificationActions.showNotification,
      setCurrentUser: storeActions.setCurrentUser,
    },
  ),
)(SignUp);
