import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import get from 'lodash/get';
import Modal from '@/components/section-modal';
import Form from '@/components/form/form';
import { api } from '@';
import Info from './info';
import Members from './members';
import { withTranslation } from 'react-i18next';
import { withRouter } from '@/hoc';
import { actions as organizationsActions } from '@/store/organizations';
import { actions as notificationActions } from '@/components/notification';
import style from './style.css';

class NewCompany extends Component {
  state = {
    step: 0,
  };

  prevStep = () => this.setState({ step: 0 });
  nextStep = () => this.setState({ step: 1 });

  create = async () => {
    let org = {
      name: this.props.name.value,
      brand_color: this.props.color.value,
    };

    if (this.props.logo.value) {
      org['icon'] = this.props.logo.value;
    }

    try {
      const { organization } = await api.createOrganization(org);
      this.props.addOrganization(organization);
      this.props.pushUrl(`/${organization.id}/chat`);
    } catch (error) {
      console.error(error);

      this.props.showNotification({
        type: 'error',
        text: error.text,
      });
    }
  };

  close = () => this.props.history.goBack();

  render() {
    const isInfoShown = this.state.step === 0;
    const isMembersShown = this.state.step === 1;
    let actions = [];
    let title = '';

    const orgConfig = {
      icon: this.props.logo.value,
      color: this.props.color.value,
      name: this.props.name.value,
    };

    if (isInfoShown) {
      title = 'Create new company';

      if (this.props.name.value) {
        actions.push({appearance: '_basic-primary', text: 'Next step', onClick: this.nextStep});
      }
    }

    if (isMembersShown) {
      title = 'Invite members of the company';
      actions.push({appearance: '_basic-divider', text: 'Back', onClick: this.prevStep});

      if (this.props.members.value.length > 0) {
        actions.push({appearance: '_basic-primary', text: 'Create', onClick: this.create});
      }
    }

    return <Modal
      title={title}
      wrapClassName={this.props.className}
      className={style.modal}
      close={this.close}
      actions={actions}
      {...isMembersShown ? {orgIcon: orgConfig} : {}}
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
  withRouter,
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

    {
      addOrganization: organizationsActions.addOrganization,
      showNotification: notificationActions.showNotification,
    },
  ),
)(NewCompany);