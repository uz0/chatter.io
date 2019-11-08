import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import get from 'lodash/get';
import Modal from '@/components/section-modal';
import Form from '@/components/form/form';
import Icon from '@/components/icon';
// import { api } from '@';
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

  // create = async () => {
  //   let org = {
  //     name: this.props.name.value,
  //     brand_color: this.props.color.value,
  //   };

  //   if (this.props.logo.value) {
  //     org['icon'] = this.props.logo.value;
  //   }

  //   try {
  //     const { organization } = await api.createOrganization(org);
  //     this.props.addOrganization(organization);

  //     if (this.props.members.value.length > 0) {
  //       for (let i = 0; i < this.props.members.value.length; i++) {
  //         const { organizations_user } = await api.organizationInvite({organization_id: organization.id, user_id: this.props.members.value[i]});
  //         this.props.addOrganizationUser(organizations_user);
  //       }
  //     }

  //     this.props.pushUrl(`/${organization.id}/chat`);
  //   } catch (error) {
  //     console.error(error);

  //     this.props.showNotification({
  //       type: 'error',
  //       text: error.text,
  //     });
  //   }
  // };

  close = () => this.props.history.goBack();

  render() {
    const isInfoShown = this.state.step === 0;
    const isMembersShown = this.state.step === 1;
    let actions = [];
    let title = '';

    if (isInfoShown) {
      title = 'New space';

      if (this.props.name.value) {
        actions.push({appearance: '_basic-primary', text: 'Next step', onClick: this.nextStep});
      }
    }

    if (isMembersShown) {
      title = <span className={style.space_title}>
        {!this.props.isPrivate.value && "#"}
        {this.props.isPrivate.value && <Icon name="lock" />}
        {this.props.name.value}
      </span>;
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
    >
      <Form
        model="new_space"
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
      name: get(state.forms, 'new_space.name', {
        error: '',
        value: '',
        isTouched: false,
        isBlured: false,
        isRequired: true,
      }),

      isPrivate: get(state.forms, 'new_space.isPrivate', {
        error: '',
        value: false,
        isTouched: false,
        isBlured: false,
        isRequired: true,
      }),

      members: get(state.forms, 'new_space.members', {
        error: '',
        value: [],
        isTouched: false,
        isBlured: false,
        isRequired: true,
      }),
    }),

    {
      addOrganization: organizationsActions.addOrganization,
      addOrganizationUser: organizationsActions.addOrganizationUser,
      showNotification: notificationActions.showNotification,
    },
  ),
)(NewCompany);