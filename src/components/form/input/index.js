import React, { Component } from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';
import find from 'lodash/find';
import { actions as formActions } from '@/components/form';
import Validators from '@/components/form/validators';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

class Input extends Component {
  onInput = event => {
    if (!this.props.modelData.isBlured) {
      this.props.formChange(this.props.model, {
        ...this.props.modelData,
        isTouched: true,
        value: event.target.value,
      });

      return;
    }

    let error = '';

    if (this.props.validations) {
      this.props.validations.forEach(validator => error = validator.action(event.target.value) ? validator.text : error);
    }

    this.props.formChange(this.props.model, {
      ...this.props.modelData,
      value: event.target.value,
      error,
    });
  }

  onBlur = event => {
    let error = '';

    if (this.props.validations) {
      this.props.validations.forEach(validator => error = validator.action(event.target.value) ? validator.text : error);
    }

    this.props.formChange(this.props.model, {
      ...this.props.modelData,
      isBlured: true,
      error,
    });
  };

  componentWillMount() {
    let isRequired = false;

    if (this.props.validations && find(this.props.validations, { action: Validators.required })) {
      isRequired = true;
    }

    this.props.formChange(this.props.model, {
      error: '',
      value: this.props.defaultValue || '',
      isTouched: false,
      isBlured: false,
      isRequired,
    });
  }

  render = () => {
    const error = this.props.modelError || this.props.error;

    return <div className={cx('container', this.props.className)}>
      {this.props.title && <p className={style.title}>{this.props.title}</p>}

      <div className={cx('section', { '_is-disabled': this.props.disabled })}>
        {this.props.icon && this.props.icon}

        <input
          type={this.props.type || 'text'}
          className={style.input}
          // при автокомплите возникает ошибка uncontrolled input
          onChange={() => {}}
          onBlur={this.onBlur}
          onInput={this.onInput}
          value={this.props.value || ''}
          placeholder={this.props.placeholder}
          {...this.props.disabled ? { disabled: true } : {}}
        />
      </div>

      {error &&
        <p className={style.error}>{error}</p>
      }
    </div>;
  }
}

export default connect(
  (state, props) => ({
    modelData: get(state, `forms.${props.model}`),
    value: get(state, `forms.${props.model}.value`, ''),
    modelError: get(state, `forms.${props.model}.error`),
  }),

  {
    formChange: formActions.formChange,
  },
)(Input);
