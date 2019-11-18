import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import { withTranslation } from 'react-i18next';
import Link from '@/components/link';
import Button from '@/components/button';
import Loading from '@/components/loading';
import Validators from '@/components/form/validators';
import Form from '@/components/new-form/form';
import Input from '@/components/input';
import { actions as notificationActions } from '@/components/notification';
import { actions as storeActions } from '@/store';
import { api } from '@';
import { withRouter } from '@/hoc';
import style from './style.css';

class SignUp extends Component {
  state = {
    isLoading: false,
  };

  login = async (data, onError) => {
    try {
      const { user } = await api.login({
        email: data.email.value,
        password: data.password.value,
      });

      this.props.setCurrentUser(user);
      window.localStorage.setItem('authToken', user.auth_token);
      window.localStorage.setItem('currentUser', JSON.stringify(user));

      this.props.showNotification({
        type: 'success',
        text: this.props.t('registered_success'),
      });

      this.props.pushUrl('/chat');
    } catch (error) {
      console.error(error);
      this.setState({ isLoading: false });
      onError(this.props.t(error.code));
    }
  };

  onSubmit = async (data, onError) => {
    if (data.password.value !== data.confirmPassword.value) {
      onError(this.props.t('passwords_not_equal'), ['password', 'confirmPassword']);
      return;
    }

    this.setState({ isLoading: true });

    try {
      await api.register({
        email: data.email.value,
        password: data.password.value,
      });

      this.login(data, onError);
    } catch (error) {
      console.error(error);
      this.setState({ isLoading: false });

      if (error.code === 'invalid_email') {
        onError(this.props.t(error.code), 'email');
        return;
      }

      onError(this.props.t(error.code));
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

      confirmPassword: {
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
        <Link to="/sign-in" className={style.link}>Log in</Link>
      </div>

      <div className={style.content}>
        <h3 className={style.subtitle}>Get started</h3>

        <Form
          fields={fields}
          onSubmit={this.onSubmit}
          isLoading={this.state.isLoading}
          className={style.form}
        >
          {
            ({ getInputProps, submitProps }) => <Fragment>
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

              <Input
                {...getInputProps('confirmPassword')}
                type="password"
                appearance="_none-classic"
                className={style.input}
                placeholder={this.props.t('repeat_password')}
              />

              <div className={style.actions}>
                <Button
                  appearance="_basic-primary"
                  text="Sign up"
                  className={style.submit}
                  {...submitProps}
                />
              </div>
            </Fragment>
          }
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
    }),

    {
      showNotification: notificationActions.showNotification,
      setCurrentUser: storeActions.setCurrentUser,
    },
  ),
)(SignUp);
