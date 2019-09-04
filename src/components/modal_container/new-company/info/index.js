import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import get from 'lodash/get';
import Button from '@/components/button';
import Validators from '@/components/form/validators';
import File from '@/components/form/file';
import Input from '@/components/form/input';
import { withTranslation } from 'react-i18next';
import { actions as formActions } from '@/components/form';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

class Info extends Component {
  setColor = value => () => this.props.formChange('new_company.color', {
    error: '',
    value,
    isTouched: true,
    isBlured: true,
    isRequired: true,
  });

  componentWillMount() {
    this.props.formChange('new_company.color', {
      error: '',
      value: '',
      isTouched: false,
      isBlured: false,
      isRequired: true,
    });
  }

  render() {
    let previewInline = {};

    if (this.props.logo.value) {
      previewInline['--image'] = `url(${this.props.logo.value})`;
    }

    const previewText = this.props.name.value ? this.props.name.value[0].toUpperCase() : 'C';
    const previewColor = this.props.logo.value ? '' : (this.props.color.value || 'none');

    return <div className={cx('info', {'_is-shown': this.props.isShown})}>
      <div className={style.logo}>
        <div className={style.preview} style={previewInline} data-color={previewColor}>
          <span className={style.text}>{previewText}</span>
        </div>

        <File
          model="new_company.logo"

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
          <Button
            appearance="_basic-divider"
            text="Upload logo"
            icon="plus"
            type="button"
            className={style.upload_button}
          />
        </File>
      </div>

      <div className={style.colors}>
        <button type="button" className={style.circle} data-color="none" onClick={this.setColor('')} />
        <button type="button" className={style.circle} data-color="blue" onClick={this.setColor('blue')} />
        <button type="button" className={style.circle} data-color="green" onClick={this.setColor('green')} />
        <button type="button" className={style.circle} data-color="pink" onClick={this.setColor('pink')} />
      </div>

      <Input
        model="new_company.name"
        placeholder="Company name"
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
      color: get(state.forms, 'new_company.color', {
        error: '',
        value: '',
        isTouched: false,
        isBlured: false,
        isRequired: true,
      }),

      name: get(state.forms, 'new_company.name', {
        error: '',
        value: '',
        isTouched: false,
        isBlured: false,
        isRequired: true,
      }),

      logo: get(state.forms, 'new_company.logo', {
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