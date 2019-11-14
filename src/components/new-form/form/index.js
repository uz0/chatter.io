import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import get from 'lodash/get';
import find from 'lodash/find';
import { actions as notificationActions } from '@/components/notification';

class Form extends Component {
  getInitialData = () => {
    let data = {};

    Object.keys(this.props.fields).forEach(key => {
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

    let data = {...this.state.data};

    Object.keys(this.props.fields).forEach(field => {
      if (!this.props.fields[field].validations) {
        return;
      }

      let error = '';
      this.props.fields[field].validations.forEach(validator => error = validator.action(this.state.data[field].value) ? validator.text : error);

      if (error !== data[field].error) {
        data[field].error = error;
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

  onError = text => {
    let data = {...this.state.data};

    Object.keys(data).forEach(key => {
      data[key].error = text;
    });

    this.setState({ data });
    this.props.showNotification({ text });
  };

  getInputProps = name => {
    return {
      onChange: () => {},
      onInput: this.onInput(name),
      value: get(this.state.data, `${name}.value`),
      error: get(this.state.data, `${name}.error`),
    };
  };

  render() {
    const isDisabled = this.props.isLoading || this.state.isLoading;

    return <form className={this.props.className}>
      {this.props.children({
        getInputProps: this.getInputProps,

        submitProps: {
          onClick: this.submit,
          disabled: isDisabled,
        },
      })}
    </form>;
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
