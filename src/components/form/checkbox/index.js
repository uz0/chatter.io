import React, { Component } from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';
import find from 'lodash/find';
import { actions as formActions } from '@/components/form';
import Validators from '@/components/form/validators';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

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

  render = () => <div className={cx('container', this.props.className)}>
    <label className={style.checkbox_wrapper}>
      <input
        type="checkbox"
        onChange={this.onChange}
        {...this.props.value ? { checked: true } : {}}
        {...this.props.disabled ? { disabled: true } : {}}
      />

      <div className={cx('switch', {'_is-checked': this.props.value})}>
        <div className={style.circle} />
      </div>
    </label>

    <p className={style.label}>{this.props.label}</p>
  </div>;
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
