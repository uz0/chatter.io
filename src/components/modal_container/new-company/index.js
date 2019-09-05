import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import get from 'lodash/get';
import Modal from '@/components/modal';
import Form from '@/components/form/form';
import Info from './info';
import Members from './members';
import { withTranslation } from 'react-i18next';
import style from './style.css';

class NewCompany extends Component {
  state = {
    step: 0,
  };

  prevStep = () => this.setState({ step: 0 });
  nextStep = () => this.setState({ step: 1 });

  create = () => {

  };

  render() {
    let actions = [];

    if (this.state.step === 0 && this.props.name.value) {
      actions.push({appearance: '_basic-primary', text: 'Next step', onClick: this.nextStep});
    }

    if (this.state.step === 1) {
      actions.push({appearance: '_basic-divider', text: 'Back', onClick: this.prevStep});
    }

    if (this.state.step === 1 && this.props.members.value.length > 0) {
      actions.push({appearance: '_basic-primary', text: 'Create', onClick: this.create});
    }

    const isInfoShown = this.state.step === 0;
    const isMembersShown = this.state.step === 1;

    return <Modal
      title="Create new company"
      className={style.modal}
      close={this.props.close}
      actions={actions}
    >
      <Form
        model="new_company"
        className={style.form}
      >
        <Info isShown={isInfoShown} />
        <Members isShown={isMembersShown} />
      </Form>
    </Modal>;
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

      members: get(state.forms, 'new_company.members', {
        error: '',
        value: [],
        isTouched: false,
        isBlured: false,
        isRequired: true,
      }),
    }),
  ),
)(NewCompany);