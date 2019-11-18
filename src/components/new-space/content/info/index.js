import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import get from 'lodash/get';
import Validators from '@/components/old-form/validators';
import Input from '@/components/old-form/input';
import { withTranslation } from 'react-i18next';
import { actions as formActions } from '@/components/old-form';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

class Info extends Component {
  render() {
    return <div className={cx('info', {'_is-shown': this.props.isShown})}>
      <p className={style.caption}>Share longer updates, keep your ideas and discuss with your team</p>

      <Input
        appearance="_border-transparent"
        model="new_space.name"
        placeholder="Space name"
        className={style.input}

        validations={[
          {
            action: Validators.required,
            text: this.props.t('validation_required', { field: this.props.t('name') }),
          },
        ]}
      />
    </div>;
  }
}

export default compose(
  withTranslation(),

  connect(
    state => ({
      name: get(state.forms, 'new_space.name', {
        error: '',
        value: '',
        isTouched: false,
        isBlured: false,
        isRequired: true,
      }),
    }),

    {
      formChange: formActions.formChange,
    },
  ),
)(Info);