import React, { Component } from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';
import find from 'lodash/find';
import { actions as formActions } from '@/components/form';
import FakeCheckbox from '@/components/fake-checkbox';
import Validators from '@/components/form/validators';

class Checkbox extends Component {
  onChange = event => {
    this.props.formChange(this.props.model, {
      ...this.props.modelData,
      error: '',
      isTouched: true,
      value: event.target.checked,
    });
  };

  componentWillMount() {
    let isRequired = false;

    if (this.props.validations && find(this.props.validations, { action: Validators.required })) {
      isRequired = true;
    }

    this.props.formChange(this.props.model, {
      error: '',
      value: this.props.defaultValue || false,
      isTouched: false,
      isRequired,
    });
  }

  render = () => <FakeCheckbox
    className={this.props.className}
    disabled={this.props.disabled}
    label={this.props.label}
    value={this.props.value}
    onChange={this.onChange}
  />;
}

export default connect(
  (state, props) => ({
    modelData: get(state, `forms.${props.model}`),
    value: get(state, `forms.${props.model}.value`, false),
  }),

  {
    formChange: formActions.formChange,
  },
)(Checkbox);
