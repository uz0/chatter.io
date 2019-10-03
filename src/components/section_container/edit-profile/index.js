import React, { Component } from 'react';
import compose from 'recompose/compose';
import get from 'lodash/get';
import { connect } from 'react-redux';
import Modal from '@/components/section-modal';
import Avatar from '@/components/avatar';
import Loading from '@/components/loading';
import Validators from '@/components/form/validators';
import Form from '@/components/form/form';
import Input from '@/components/form/input';
import Checkbox from '@/components/form/checkbox';
import File from '@/components/form/file';
import { api } from '@';
import { copy } from '@/helpers';
import { actions as formActions } from '@/components/form';
import { actions as notificationActions } from '@/components/notification';
import modalActions from '@/components/modal_container/actions';
import { withTranslation } from 'react-i18next';
import style from './style.css';

class EditProfile extends Component {
  state = {
    isLoading: false,
  };

  submit = event => {
    event.preventDefault();

    const {
      avatar,
      nick,
      searchable_nick,
    } = this.props.formData;

    if (!avatar || !nick || !searchable_nick) {
      return;
    }

    if (!avatar.isTouched && !nick.isTouched && !searchable_nick.isTouched) {
      return;
    }

    if (avatar.error || nick.error || searchable_nick.error) {
      return;
    }

    this.setState({ isLoading: true });

    api.updateMe({
      ...avatar.isTouched ? { avatar: avatar.value } : {},
      ...nick.value && nick.isTouched ? { nick: nick.value } : {},
      ...searchable_nick.isTouched ? { searchable_nick: searchable_nick.value } : {},
    }).then(() => {
      this.setState({ isLoading: false });

      this.props.showNotification({
        type: 'success',
        text: this.props.t('profile_updated'),
      });

      this.props.formReset('profile');
      this.props.close();
    }).catch(error => {
      this.setState({ isLoading: false });

      if (error.text === 'nick is in use') {
        this.props.showNotification({
          type: 'error',
          text: this.props.t('nick_in_use'),
        });

        return;
      }

      this.props.showNotification({
        type: 'error',
        text: this.props.t(error.code),
      });
    });
  };

  openChangePasswordModal = () => this.props.toggleModal({ id: 'change-profile-modal' });

  deletePhoto = () => this.props.formChange('profile.avatar', {
    ...this.props.formData.avatar,
    value: '',
    isTouched: true,
  });

  resend = () => api.resendConfirmation({ email: this.props.currentUser.email }).then(() => {
    this.props.showNotification({
      type: 'success',
      text: this.props.t('confirmation_resended'),
    });
  });

  copyInviteLink = () => copy(`${location.origin}/joinuser/${this.props.currentUser.nick.replace(' ', '+')}`, () => {
    this.props.showNotification({
      type: 'success',
      text: this.props.t('invite_code_copied'),
    });
  });

  isActionDisabled = () => {
    if (this.state.isLoading) {
      return true;
    }

    const {
      avatar,
      nick,
      searchable_nick,
    } = this.props.formData;

    if (!avatar || !nick || !searchable_nick) {
      return true;
    }

    if (!avatar.isTouched && !nick.isTouched && !searchable_nick.isTouched) {
      return true;
    }

    if (avatar.error || nick.error || searchable_nick.error) {
      return true;
    }

    return false;
  };

  render() {
    const isActionDisabled = this.isActionDisabled();
    const invite_link = this.props.currentUser.nick && `${location.origin}/joinuser/${this.props.currentUser.nick.replace(' ', '+')}`;
    let photo = get(this.props.formData, 'avatar.value');

    if (!photo && !get(this.props.formData, 'avatar.isTouched')) {
      photo = get(this.props.currentUser, 'avatar.small', '/assets/default-user.jpg');
    }

    const letter = (!photo && this.props.currentUser.nick) && this.props.currentUser.nick[0];

    const actions = [
      {appearance: '_basic-divider', text: 'Change password', onClick: this.openChangePasswordModal},
      {appearance: '_basic-primary', text: this.props.t('update'), onClick: this.submit, disabled: isActionDisabled},
    ];

    return <Modal
      title={this.props.t('profile')}
      className={style.modal}
      close={this.props.close}
      actions={actions}
    >
      <Form
        model="profile"
        className={style.form}
      >
        <Avatar
          {...photo ? {photo} : {}}
          {...letter ? {letter} : {}}
          className={style.avatar}
        />

        <div className={style.photo_actions}>
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
            <button type="button" className={style.edit}>Change</button>
          </File>

          <button type="button" className={style.delete} onClick={this.deletePhoto}>Delete</button>
        </div>

        <Input
          appearance="_none-divider"
          placeholder={this.props.t('nick')}
          model="profile.nick"
          defaultValue={this.props.currentUser.nick}
          className={style.input}
          title="Nickname"

          validations={[
            {
              action: Validators.required,
              text: this.props.t('validation_required', { field: this.props.t('nick') }),
            },

            {
              action: Validators.minLength(4),
              text: this.props.t('validation_min_length', { field: this.props.t('nick'), count: 4 }),
            },
          ]}
        />

        <Checkbox
          className={style.checkbox}
          label={this.props.t('can_be_found_in_the_search')}
          model="profile.searchable_nick"
          defaultValue={this.props.currentUser.searchable_nick}
        />

        <Input
          appearance="_none-divider"
          placeholder={this.props.t('email')}
          type="email"
          model="profile.email"
          defaultValue={this.props.currentUser.email}
          className={style.input}
          title="Email"
          disabled
        />

        <div className={style.email_additional}>
          {this.props.currentUser.confirmed_at &&
            <span className={style.confirmed}>{this.props.t('confirmed')}</span>}

          {!this.props.currentUser.confirmed_at &&
            <span className={style.not_confirmed}>{this.props.t('not_confirmed')}</span>}

          {!this.props.currentUser.confirmed_at &&
            <button
              type="button"
              onClick={this.resend}
              className={style.resend}
            >{this.props.t('send_confirmation_again')}</button>
          }
        </div>

        {this.props.currentUser.nick &&
          <div className={style.invite}>
            <p className={style.label}>Your invation link</p>
            <p className={style.url}>{invite_link}</p>
            <button className={style.copy} type="button" onClick={this.copyInviteLink}>Copy</button>
          </div>
        }

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
      formReset: formActions.formReset,
      toggleModal: modalActions.toggleModal,
      showNotification: notificationActions.showNotification,
    },
  ),
)(EditProfile);
