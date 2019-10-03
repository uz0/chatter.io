import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import Modal from '@/components/section-modal';
import Loading from '@/components/loading';
import Validators from '@/components/form/validators';
import Form from '@/components/form/form';
import Input from '@/components/form/input';
import { api } from '@';
import { actions as formActions } from '@/components/form';
import { actions as notificationActions } from '@/components/notification';
import { withTranslation } from 'react-i18next';
import style from './style.css';

const defaultInputData = {error: "", value: null, isTouched: false, isBlured: false, isRequired: false};

class ChangePassword extends Component {
  state = {
    isLoading: false,
  };

  submit = () => {
    const {
      current_password,
      password,
      confirm_password,
    } = this.props.formData;

    if (!current_password || !password || !confirm_password) {
      return;
    }

    if (!current_password.isTouched || !password.isTouched || !confirm_password.isTouched) {
      return;
    }

    if (current_password.error || password.error || confirm_password.error) {
      return;
    }

    if (!current_password.value || !password.value || !confirm_password.value) {
      return;
    }

    if (password.value !== confirm_password.value) {
      this.props.showNotification({
        type: 'info',
        text: this.props.t('passwords_not_equal'),
      });

      return;
    }

    this.setState({ isLoading: true });

    api.updateMe({
      current_password: current_password.value,
      password: password.value,
    }).then(() => {
      this.setState({ isLoading: false });

      this.props.showNotification({
        type: 'success',
        text: this.props.t('password_updated'),
      });

      this.props.formChange('profile.current_password', defaultInputData);
      this.props.formChange('profile.password', defaultInputData);
      this.props.formChange('profile.confirm_password', defaultInputData);
      this.props.close();
    }).catch(error => {
      this.setState({ isLoading: false });

      this.props.showNotification({
        type: 'error',
        text: this.props.t(error.code),
      });
    });
  };

  isActionDisabled = () => {
    if (this.state.isLoading) {
      return true;
    }

    const {
      current_password,
      password,
      confirm_password,
    } = this.props.formData;

    if (!current_password || !password || !confirm_password) {
      return true;
    }

    if (!current_password.isTouched || !password.isTouched || !confirm_password.isTouched) {
      return true;
    }

    if (current_password.error || password.error || confirm_password.error) {
      return true;
    }

    if (!current_password.value || !password.value || !confirm_password.value) {
      return true;
    }

    return false;
  };

  componentWillUnmount() {
    this.props.formChange('profile.current_password', defaultInputData);
    this.props.formChange('profile.password', defaultInputData);
    this.props.formChange('profile.confirm_password', defaultInputData);
  }

  render() {
    const isActionDisabled = this.isActionDisabled();

    const actions = [
      {
        appearance: '_basic-primary',
        text: this.props.t('update'),
        onClick: this.submit,
        disabled: isActionDisabled,
      },
    ];

    return <Modal
      title={this.props.t('change_password')}
      className={style.modal}
      close={this.props.close}
      actions={actions}
    >
      <Form
        model="profile"
        className={style.form}
      >
        <Input
          type="password"
          placeholder={this.props.t('old_password')}
          model="profile.current_password"
          className={style.input}
          title="Old password"

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
          type="password"
          placeholder={this.props.t('new_password')}
          model="profile.password"
          className={style.input}
          title="New password"

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
          type="password"
          placeholder={this.props.t('confirm_password')}
          model="profile.confirm_password"
          className={style.input}
          title="Confirm password"

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

        <Loading isShown={this.state.isLoading} />
      </Form>
    </Modal>;
  }
}

export default compose(
  withTranslation(),

  connect(
    state => ({
      currentUser: state.currentUser,
      formData: state.forms.profile,
    }),

    {
      formChange: formActions.formChange,
      showNotification: notificationActions.showNotification,
    },
  ),
)(ChangePassword);
