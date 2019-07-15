import React, { Component } from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';
import find from 'lodash/find';
import { actions as formActions } from '@/components/form';
import Validators from '@/components/form/validators';
import style from './style.css';

class Input extends Component {
  openFileBrowser = () => {
    this.inputRef.value = "";
    this.inputRef.click();
  }

  onChange = event => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    let error = '';

    if (this.props.validations) {
      this.props.validations.forEach(validator => error = validator.action(file) ? validator.text : error);
    }

    if (error) {
      this.inputRef.value = '';

      this.props.formChange(this.props.model, {
        ...this.props.modelData,
        error,
      });

      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      this.props.formChange(this.props.model, {
        ...this.props.modelData,
        error: '',
        isTouched: true,
        value: reader.result,
      });
    };

    reader.readAsDataURL(file);
  };

  componentDidMount() {
    let isRequired = false;

    if (this.props.validations && find(this.props.validations, { action: Validators.required })) {
      isRequired = true;
    }

    this.props.formChange(this.props.model, {
      ...this.props.modelData,
      error: '',
      value: this.props.defaultValue || null,
      isTouched: false,
      isRequired,
    });
  }

  render = () => <div className={style.file}>
    <input type="file" onChange={this.onChange} ref={node => this.inputRef = node} />
    {React.cloneElement(this.props.children, { onClick: this.openFileBrowser })}

    {this.props.modelError &&
      <p className={style.error}>{ this.props.modelError }</p>
    }
  </div>;
}

export default connect(
  (state, props) => ({
    modelData: get(state, `forms.${props.model}`),
    value: get(state, `forms.${props.model}.value`),
    modelError: get(state, `forms.${props.model}.error`),
  }),

  {
    formChange: formActions.formChange,
  },
)(Input);
