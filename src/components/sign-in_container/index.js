import React, { Component } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import Link from '@/components/link';
import Form from '@/components/form/form';
import Validators from '@/components/form/validators';
import Input from '@/components/form/input';
import { withNamespaces } from 'react-i18next';
import { actions as notificationActions } from '@/components/notification';
import { actions as formActions } from '@/components/form';
import { actions as storeActions } from '@/store';
import { api } from '@';
import { withRouter } from '@/hoc';
import style from './style.css';

class SignIn extends Component {
  state = {
    commonError: {},
    isLoading: false,
  };

  submit = event => {
    event.preventDefault();
    this.setState({ isLoading: true });

    api.login({
      email: this.props.formData.email.value,
      password: this.props.formData.password.value,
    }).then(data => {
      console.log('data', data);
      this.setState({ isLoading: false });
      this.props.formReset('login');
      this.props.setCurrentUser(data.user);
      window.localStorage.setItem('authToken', data.user.auth_token);
      window.localStorage.setItem('currentUser', JSON.stringify(data.user));
      this.props.showNotification(this.props.t('you_logged_success'));
      this.props.pushUrl('/chat');
    }).catch(error => {
      this.setState({ commonError: this.props.t(error.code), isLoading: false });
      this.props.showNotification(this.props.t(error.code));
    });
  }

  componentWillMount() {
    if (this.props.currentUser) {
      this.props.pushUrl('/');
      return;
    }
  }

  render = () => {
    return <div className={style.login}>
      <Link to="/" className={style.logo}>Unichat</Link>

      <nav>
        <Link className={style.active_link} to="/sign-in">{this.props.t('log_in')}</Link>
        <Link to="/sign-up">{this.props.t('sign_up')}</Link>
      </nav>

      <Form
        actions={[
          { text: `${this.props.t('log_in')}`, appearance: '_basic-primary', onClick: this.submit, type: 'submit' },
          { text: `${this.props.t('forgot_password')}?`, to: '/forgot-password' },
        ]}

        error={this.state.commonError.text || ''}
        model="login"
        disabled={this.state.isLoading}
        className={style.form}
      >
        <Input
          type="email"
          class="light"
          placeholder={this.props.t('email')}
          model="login.email"
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
          class="light"
          placeholder={this.props.t('password')}
          model="login.password"
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
      </Form>
    </div>;
  }
}

export default compose(
  withRouter,
  withNamespaces('translation'),

  connect(
    state => ({
      formData: state.forms.login,
      currentUser: state.currentUser,
    }),

    {
      formReset: formActions.formReset,
      showNotification: notificationActions.showNotification,
      setCurrentUser: storeActions.setCurrentUser,
    },
  ),
)(SignIn);
