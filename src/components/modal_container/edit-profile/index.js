import React, { Component, Fragment } from 'react';
import compose from 'recompose/compose';
import get from 'lodash/get';
import classnames from 'classnames/bind';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import Modal from '@/components/modal';
import Avatar from '@/components/avatar';
import Button from '@/components/button';
import Loading from '@/components/loading';
import Validators from '@/components/form/validators';
import Form from '@/components/form/form';
import Input from '@/components/form/input';
import Checkbox from '@/components/form/checkbox';
import File from '@/components/form/file';
import { api } from '@';
import { actions as formActions } from '@/components/form';
import { actions as notificationActions } from '@/components/notification';
import { actions as modalActions } from '@/components/modal_container';
import { withNamespaces } from 'react-i18next';
import style from './style.css';

const cx = classnames.bind(style);

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
      ...avatar.value && avatar.isTouched ? { avatar: avatar.value } : {},
      ...nick.value && nick.isTouched ? { nick: nick.value } : {},
      ...searchable_nick.isTouched ? { searchable_nick: searchable_nick.value } : {},
    }).then(() => {
      this.setState({ isLoading: false });
      this.props.showNotification(this.props.t('profile_updated'));
      this.props.formReset('profile');
      this.props.close();
    }).catch(error => {
      this.setState({ isLoading: false });

      if (error.text === 'nick is in use') {
        this.props.showNotification(this.props.t('nick_in_use'));
        return;
      }

      this.props.showNotification(this.props.t(error.code));
    });
  };

  openChangePasswordModal = () => this.props.toggleModal({ id: 'change-password-modal' });

  resend = () => api.resendConfirmation({ email: this.props.currentUser.email }).then(() => {
    this.props.showNotification(this.props.t('confirmation_resended'));
  });

  copyInviteLink = () => {
    this.inviteLinkRef.select();
    document.execCommand('copy');
    this.props.showNotification(this.props.t('invite_link_copied'));
  };

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
    const photo = get(this.props.formData, 'avatar.value') || get(this.props.currentUser, 'avatar.small', '/assets/default-user.jpg');

    return <Modal
      id="edit-profile-modal"
      title={this.props.t('edit_profile')}
      className={style.modal}
      wrapClassName={style.wrapper}
      close={this.props.close}

      actions={[
        { text: this.props.t('update'), onClick: this.submit, disabled: isActionDisabled },
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

        <Checkbox
          className={style.checkbox}
          label={this.props.t('can_be_found_in_the_search')}
          model="profile.searchable_nick"
          defaultValue={this.props.currentUser.searchable_nick}
        />

        <Button
          appearance="_basic-primary"
          type="button"
          text="Change password"
          className={style.change_password_button}
          onClick={this.openChangePasswordModal}
        />

        {this.props.currentUser.nick && <Fragment>
          <div className={style.section}>
            <p className={style.title}>{this.props.t('invite_link')}</p>
            <button type="button" onClick={this.copyInviteLink}>Copy</button>
          </div>

          <input
            type="text"
            readOnly
            ref={node => this.inviteLinkRef = node}
            value={invite_link}
            className={style.invite_link_input}
          />
        </Fragment>}

        <Loading isShown={this.state.isLoading} />
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
      formData: state.forms.profile,
    }),

    {
      formReset: formActions.formReset,
      toggleModal: modalActions.toggleModal,
      showNotification: notificationActions.showNotification,
    },
  ),
)(EditProfile);
