import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import { withTranslation } from 'react-i18next';
import Link from '@/components/link';
import Button from '@/components/button';
import Loading from '@/components/loading';
import Validators from '@/components/old-form/validators';
import Form from '@/components/form';
import Input from '@/components/input';
import { actions as notificationActions } from '@/components/notification';
import { actions as storeActions } from '@/store';
import { api } from '@';
import { withRouter } from '@/hoc';
import style from './style.css';

class ForgotPassword extends Component {
  state = {
    isLoading: false,
  };

  requestPasswordReset = async (data, onError) => {
    try {
      this.setState({ isLoading: true });
      await api.requestPasswordReset({ email: data.email.value });
      this.setState({ isLoading: false });

      this.props.showNotification({
        type: 'success',
        text: this.props.t('check_your_email'),
      });
    } catch (error) {
      console.error(error);
      this.setState({ isLoading: false });
      onError(this.props.t(error.code));
    }
  };

  resetPassword = async (data, onError) => {
    const params = new URLSearchParams(window.location.search);
    const password_reset_token = params.get('password_reset_token');

    if (data.password.value !== data.confirmPassword.value) {
      onError(this.props.t('passwords_not_equal'));
      return;
    }

    try {
      this.setState({ isLoading: true });
      await api.resetPassword({ token: password_reset_token, password: data.password.value });
      this.setState({ isLoading: false });

      this.props.showNotification({
        type: 'success',
        text: this.props.t('password_updated'),
      });

      this.props.pushUrl('/sign-in', null);
    } catch (error) {
      console.error(error);
      this.setState({ isLoading: false });
      onError(this.props.t(error.code));
    }
  };

  onSubmit = (data, onError) => {
    const params = new URLSearchParams(window.location.search);
    const password_reset_token = params.get('password_reset_token');

    if (password_reset_token) {
      this.resetPassword(data, onError);
      return;
    }

    this.requestPasswordReset(data, onError);
  };

  getFields = () => {
    const params = new URLSearchParams(window.location.search);
    const password_reset_token = params.get('password_reset_token');

    if (!password_reset_token) {
      return {
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
      };
    }

    return {
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
  };

  componentWillMount() {
    if (this.props.currentUser) {
      this.props.pushUrl('/');
      return;
    }
  }

  render() {
    const params = new URLSearchParams(window.location.search);
    const password_reset_token = params.get('password_reset_token');
    const submitTitle = password_reset_token ? this.props.t('change') : this.props.t('send_recovery_link');
    const fields = this.getFields();

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

        <Form
          fields={fields}
          onSubmit={this.onSubmit}
          isLoading={this.state.isLoading}
          className={style.form}
        >
          {
            ({ getInputProps, submitProps }) => <Fragment>
              {!password_reset_token &&
                <Input
                  {...getInputProps('email')}
                  appearance="_none-classic"
                  className={style.input}
                  placeholder={this.props.t('email')}
                />
              }

              {password_reset_token &&
                <Fragment>
                  <Input
                    {...getInputProps('password')}
                    type="password"
                    appearance="_none-classic"
                    className={style.input}
                    placeholder={this.props.t('new_password')}
                  />

                  <Input
                    {...getInputProps('confirmPassword')}
                    type="password"
                    appearance="_none-classic"
                    className={style.input}
                    placeholder={this.props.t('confirm_password')}
                  />
                </Fragment>
              }

              <div className={style.actions}>
                <Button
                  appearance="_basic-primary"
                  text={submitTitle}
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
)(ForgotPassword);
