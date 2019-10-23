import React, { Component } from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';
import find from 'lodash/find';
import TextareaField from '@/components/textarea';
import { actions as formActions } from '@/components/form';
import Validators from '@/components/form/validators';

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
  };

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

  onChange = () => {};

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

    return <TextareaField
      id={this.props.id}
      appearance={this.props.appearance}
      icon={this.props.icon}
      title={this.props.title}
      onChange={this.onChange}
      onBlur={this.onBlur}
      onInput={this.onInput}
      value={this.props.value}
      placeholder={this.props.placeholder}
      disabled={this.props.disabled}
      error={error}
      className={this.props.className}
    />;
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
