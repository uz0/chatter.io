import React, { Component } from 'react';
import compose from 'recompose/compose';
import classnames from 'classnames/bind';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import Modal from '@/components/modal';
import Avatar from '@/components/avatar';
import Validators from '@/components/form/validators';
import Form from '@/components/form/form';
import Input from '@/components/form/input';
import { withNamespaces } from 'react-i18next';
import style from './style.css';

const cx = classnames.bind(style);

class EditProfile extends Component {
  render() {
    return <Modal
      id="edit-profile-modal"
      title={this.props.t('edit_profile')}
      className={style.modal}
      wrapClassName={style.wrapper}
      close={this.props.close}

      actions={[
        { text: this.props.t('update'), onClick: () => {} },
      ]}
    >
      <Form
        model="profile"
        className={style.form}
      >
        <Avatar photo="/assets/default-user.jpg" className={style.avatar} />
        <button>Edit</button>

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

            {
              action: Validators.contains(' '),
              text: this.props.t('validation_contains_spaces', { field: this.props.t('nick') }),
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
          </div>

          <Input
            type="email"
            placeholder={this.props.t('email')}
            model="login.email"
            defaultValue={this.props.currentUser.email}
            className={style.input}
            disabled
          />

          {!this.props.currentUser.confirmed_at &&
            <button class={style.resend} type="button" onClick={this.resend}>
              {this.props.t('send_confirmation_again')}
            </button>
          }
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
    }),
  ),
)(EditProfile);
