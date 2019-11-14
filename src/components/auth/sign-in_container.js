import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import get from 'lodash/get';
import Link from '@/components/link';
import Button from '@/components/button';
import Loading from '@/components/loading';
import Validators from '@/components/form/validators';
import Form from '@/components/new-form/form';
import Input from '@/components/input';
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

  onSubmit = async (data, onError) => {
    this.setState({ isLoading: true });

    try {
      const { user } = await api.login({
        email: data.email.value,
        password: data.password.value,
      });

      this.setState({ isLoading: false });
      this.props.formReset('login');
      this.props.setCurrentUser(user);
      window.localStorage.setItem('authToken', user.auth_token);
      window.localStorage.setItem('currentUser', JSON.stringify(user));

      this.props.showNotification({
        type: 'success',
        text: this.props.t('you_logged_success'),
      });

      this.props.pushUrl('/chat');
    } catch (error) {
      console.error(error);
      this.setState({ isLoading: false });
      onError(error.text);
    }
  };

  componentWillMount() {
    if (this.props.currentUser) {
      this.props.pushUrl('/');
      return;
    }
  }

  render() {
    const fields = {
      email: {
        validations: [
          {
            action: Validators.required,
            text: this.props.t('validation_required', { field: this.props.t('email') }),
          },

          {
            action: Validators.email,
            text: this.props.t('validation_correct', { field: this.props.t('email') }),
          },
        ],
      },

      password: {
        validations: [
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
        ],
      },
    };

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

        <Form
          fields={fields}
          onSubmit={this.onSubmit}
          isLoading={this.state.isLoading}
          className={style.form}
        >
          {({ getInputProps, submitProps }) => {
            return <Fragment>
              <Input
                {...getInputProps('email')}
                appearance="_none-classic"
                className={style.input}
                placeholder={this.props.t('email')}
              />

              <Input
                {...getInputProps('password')}
                type="password"
                appearance="_none-classic"
                className={style.input}
                placeholder={this.props.t('password')}
              />

              <div className={style.actions}>
                <Button
                  appearance="_basic-primary"
                  text="Log in"
                  className={style.submit}
                  {...submitProps}
                />

                <Link to="/forgot-password" className={style.forgot}>Forgot password?</Link>
              </div>
            </Fragment>;
          }}
        </Form>
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
