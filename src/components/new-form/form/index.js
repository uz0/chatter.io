import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import clone from 'lodash/clone';
import forEach from 'lodash/forEach';
import get from 'lodash/get';
import find from 'lodash/find';
import { actions as notificationActions } from '@/components/notification';

class Form extends Component {
  getInitialData = () => {
    let data = {};

    forEach(this.props.fields, (field, key) => {
      data[key] = {
        value: '',
        error: '',
      };
    });

    return data;
  };

  state = {
    data: this.getInitialData(),
    isLoading: false,
  };

  submit = async () => {
    this.validate();
    const erroredField = find(this.state.data, 'error');

    if (erroredField) {
      this.props.showNotification({ text: erroredField.error });
      return;
    }

    if (this.props.isLoading === undefined) {
      this.setState({ isLoading: true });
    }

    await this.props.onSubmit(this.state.data, this.onError);

    if (this.props.isLoading === undefined && this.state.isLoading) {
      this.setState({ isLoading: false });
    }
  };

  validate = () => {
    if (!find(this.props.fields, 'validations')) {
      return;
    }

    let data = clone(this.state.data);

    forEach(this.props.fields, (field, key) => {
      if (!field.validations) {
        return;
      }

      let error = '';

      field.validations.forEach(validator => {
        if (validator.action(data[key].value)) {
          error = validator.text;
        }
      });

      if (error !== data[key].error) {
        data[key].error = error;
      }
    });

    this.setState({ data });
  };

  onInput = name => event => this.setState({
    data: {
      ...this.state.data,

      [name]: {
        ...this.state.data[name],
        value: event.target.value,
      },
    },
  });

  onError = (text, fields) => {
    let data = clone(this.state.data);

    forEach(data, (item, key) => {
      if (!fields) {
        item.error = text;
        return;
      }

      if (fields.includes(key)) {
        item.error = text;
      }
    });

    this.setState({ data });
    this.props.showNotification({ text });
  };

  getInputProps = name => ({
    onChange: () => {},
    onInput: this.onInput(name),
    value: get(this.state.data, `${name}.value`),
    error: get(this.state.data, `${name}.error`),
  });

  render() {
    const isDisabled = this.props.isLoading || this.state.isLoading;

    return (
      <form className={this.props.className}>
        {
          this.props.children({
            getInputProps: this.getInputProps,

            submitProps: {
              onClick: this.submit,
              disabled: isDisabled,
            },
          })
        }
      </form>
    );
  }
}

export default compose(
  connect(
    null,

    {
      showNotification: notificationActions.showNotification,
    },
  ),
)(Form);
