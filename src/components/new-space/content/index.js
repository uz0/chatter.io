import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import get from 'lodash/get';
import Modal from '@/components/section-modal';
import Form from '@/components/old-form/form';
import Icon from '@/components/icon';
import { api } from '@';
import Info from './info';
import Members from './members';
import { withTranslation } from 'react-i18next';
import { withRouter } from '@/hoc';
import { actions as organizationsActions } from '@/store/organizations';
import { actions as subscriptionsActions } from '@/store/subscriptions';
import { actions as notificationActions } from '@/components/notification';
import style from './style.css';

class NewCompany extends Component {
  state = {
    step: 0,
  };

  prevStep = () => this.setState({ step: 0 });
  nextStep = () => this.setState({ step: 1 });

  create = async () => {
    try {
      const { subscription } = await api.createRoom({ name: this.props.name.value, user_ids: this.props.members.value });

      this.props.addSubscription(subscription);

      const { group } = await api.updateGroup({ subscription_id: subscription.id, is_space: true });

      this.props.updateSubscription({
        id: subscription.id,

        group: {
          ...group,
          type: this.props.isPrivate.value ? 'private_chat' : 'room',
        },
      });

      this.props.pushUrl(`chat/${subscription.id}`);
    } catch (error) {
      console.error(error);

      this.props.showNotification({
        type: 'error',
        text: error.text,
      });
    }
  };

  close = () => this.props.history.push('/');

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
        {!this.props.isPrivate.value ? "#" : <Icon className={style.icon} name="lock" />}

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
      addSubscription: subscriptionsActions.addSubscription,
      updateSubscription: subscriptionsActions.updateSubscription,
      addOrganization: organizationsActions.addOrganization,
      addOrganizationUser: organizationsActions.addOrganizationUser,
      showNotification: notificationActions.showNotification,
    },
  ),
)(NewCompany);