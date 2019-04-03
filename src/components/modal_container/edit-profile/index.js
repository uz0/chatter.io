import React, { Component } from 'react';
import compose from 'recompose/compose';
import get from 'lodash/get';
import classnames from 'classnames/bind';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import Modal from '@/components/modal';
import Avatar from '@/components/avatar';
import Validators from '@/components/form/validators';
import Form from '@/components/form/form';
import Input from '@/components/form/input';
import Checkbox from '@/components/form/checkbox';
import File from '@/components/form/file';
import { api } from '@';
import { actions as formActions } from '@/components/form';
import { actions as storeActions } from '@/store';
import { actions as notificationActions } from '@/components/notification';
import { withNamespaces } from 'react-i18next';
import style from './style.css';

const cx = classnames.bind(style);

class EditProfile extends Component {
  submit = event => {
    event.preventDefault();

    const avatar = this.props.forms.profile.avatar.value;
    const nick = this.props.forms.profile.nick.value;
    const searchable_nick = this.props.forms.profile.searchableNick.value;
    const password = this.props.forms.profile.password.value;
    const oldPassword = this.props.forms.profile.oldPassword.value;
    const confirmPassword = this.props.forms.profile.confirmPassword.value;


    const isPasswordNoChanged = !this.props.forms.profile.oldPassword.value &&
      !this.props.forms.profile.password.value &&
      !this.props.forms.profile.confirmPassword.value;

    if (isPasswordNoChanged) {
      api.updateMe({
        ...avatar && this.props.forms.profile.avatar.isTouched ? { avatar } : {},
        ...nick && this.props.forms.profile.nick.isTouched ? { nick } : {},
        ...this.props.forms.profile.searchableNick.isTouched ? { searchable_nick } : {},
      }).then(() => {
        this.props.showNotification(this.props.t('profile_updated'));
        this.props.formReset('profile');
        this.props.close();
      }).catch(error => this.props.showNotification(this.props.t(error.text)));

      return;
    }

    const isAnyPasswordFieldEmpty = !oldPassword ||
      !password ||
      !confirmPassword;

    if (isAnyPasswordFieldEmpty) {
      this.props.showNotification(this.props.t('fill_all_paswords'));
      return;
    }

    if (password !== confirmPassword) {
      this.props.showNotification(this.props.t('passwords_not_equal'));
      return;
    }

    api.updateMe({
      ...avatar && this.props.forms.profile.avatar.isTouched ? { avatar } : {},
      ...nick && this.props.forms.profile.nick.isTouched ? { nick } : {},
      ...this.props.forms.profile.searchableNick.isTouched ? { searchable_nick } : {},
      current_password: oldPassword,
      password,
    }).then(() => {
      this.props.showNotification(this.props.t('profile_updated'));
      this.props.formReset('profile');
      this.props.close();
    }).catch(error => this.props.showNotification(this.props.t(error.text)));
  };

  resend = () => api.resendConfirmation({ email: this.props.currentUser.email }).then(() => {
    this.props.showNotification(this.props.t('confirmation_resended'));
  });

  render() {
    const photo = get(this.props.forms, 'profile.avatar.value') ||
      get(this.props.currentUser, 'avatar.small', '/assets/default-user.jpg');

    return <Modal
      id="edit-profile-modal"
      title={this.props.t('edit_profile')}
      className={style.modal}
      wrapClassName={style.wrapper}
      close={this.props.close}

      actions={[
        { text: this.props.t('update'), onClick: this.submit },
      ]}
    >
      <Form
        model="profile"
        className={style.form}
      >
        <Avatar photo={photo} className={style.avatar} />

        <File
          model="profile.avatar"

          validations={[
            {
              action: Validators.fileMaxSize(200000),
              text: this.props.t('file_max_size', { type: this.props.t('image'), count: 200, unit: this.props.t('kb') }),
            },

            {
              action: Validators.fileExtensions(['jpeg', 'png']),
              text: this.props.t('file_extensions', { extensions: '"jpeg", "png"' }),
            },

            {
              action: Validators.fileType('image'),
              text: this.props.t('file_type', { type: this.props.t('image') }),
            },
          ]}
        >
          <button type="button" className={style.edit}>Edit</button>
        </File>

        <Input
          placeholder={this.props.t('nick')}
          model="profile.nick"
          defaultValue={this.props.currentUser.nick}
          className={style.input}
          title="Change nickname"

          validations={[
            // {
            //   action: Validators.required,
            //   text: this.props.t('validation_required', { field: this.props.t('nick') }),
            // },

            {
              action: Validators.minLength(4),
              text: this.props.t('validation_min_length', { field: this.props.t('nick'), count: 4 }),
            },

            {
              action: Validators.contains(' '),
              text: this.props.t('validation_contains_spaces', { field: this.props.t('nick') }),
            },
          ]}
        />

        <Checkbox
          className={style.checkbox}
          label={this.props.t('can_be_found_in_the_search')}
          model="profile.searchableNick"
          defaultValue={this.props.currentUser.searchable_nick}
        />

        <div className={cx('email', { '_is-confirmed': !!this.props.currentUser.confirmed_at })}>
          <div className={style.title}>
            Email

            {this.props.currentUser.confirmed_at &&
              <span className={style.confirmed}> {this.props.t('confirmed')}</span>}

            {!this.props.currentUser.confirmed_at &&
              <span className={style.not_confirmed}> {this.props.t('not_confirmed')}</span>}

            {!this.props.currentUser.confirmed_at &&
              <button
                type="button"
                onClick={this.resend}
                className={style.resend}
              >{this.props.t('send_confirmation_again')}</button>
            }
          </div>

          <Input
            type="email"
            placeholder={this.props.t('email')}
            model="login.email"
            defaultValue={this.props.currentUser.email}
            className={style.input}
            disabled
          />
        </div>

        <Input
          type="password"
          placeholder={this.props.t('old_password')}
          model="profile.oldPassword"
          className={style.input}
          title="Change password"

          validations={[
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

          validations={[
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
          model="profile.confirmPassword"
          className={style.input}

          validations={[
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
    </Modal>;
  }
}

export default compose(
  withRouter,
  withNamespaces('translation'),

  connect(
    state => ({
      currentUser: state.currentUser,
      forms: state.forms,

      // state.forms.profile не отслеживает изменения redux
      // formData: state.forms.profile,
    }),

    {
      formChange: formActions.formChange,
      formReset: formActions.formReset,
      showNotification: notificationActions.showNotification,
      setCurrentUser: storeActions.setCurrentUser,
    },
  ),
)(EditProfile);
