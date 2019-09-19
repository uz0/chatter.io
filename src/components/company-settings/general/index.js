import React, { Component } from 'react';
import get from 'lodash/get';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import Modal from '@/components/modal';
import Button from '@/components/button';
import Navigation from '@/components/navigation';
import OrganizationIcon from '@/components/organization-icon';
import Validators from '@/components/form/validators';
import File from '@/components/form/file';
import Input from '@/components/form/input';
import { api } from '@';
import { withRouter } from '@/hoc';
import { actions as formActions } from '@/components/form';
import { actions as notificationActions } from '@/components/notification';
import { actions as organizationsActions } from '@/store/organizations';
import { withTranslation } from 'react-i18next';
import style from './style.css';

class General extends Component {
  setColor = value => () => this.props.formChange('edit_company.color', {
    error: '',
    value,
    isTouched: true,
    isBlured: true,
    isRequired: true,
  });

  update = async () => {
    if (!this.props.name.value) {
      return;
    }

    let org = {
      organization_id: this.props.organization.id,
      name: this.props.name.value,
    };

    if (this.props.color.value) {
      org['brand_color'] = this.props.color.value;
    }

    if (this.props.logo.value && typeof this.props.logo.value === 'string') {
      org['icon'] = this.props.logo.value;
    }

    try {
      const { organization } = await api.updateOrganization(org);
      this.props.updateOrganization(organization);

      this.props.showNotification({
        type: 'success',
        text: 'Organization has been updated',
      });
    } catch (error) {
      this.props.showNotification({
        type: 'error',
        text: error.text,
      });
    }
  };

  delete = () => {
    api.destroyOrganization({organization_id: this.props.organization.id});
    this.close();
  };

  close = () => {
    const id = parseInt(this.props.match.params.orgId, 10);
    this.props.pushUrl(`/${id}/chat`);
  };

  componentWillMount() {
    this.props.formChange('edit_company.color', {
      error: '',
      value: this.props.organization.brand_color,
      isTouched: false,
      isBlured: false,
      isRequired: true,
    });
  }

  componentWillUnmount() {
    this.props.formChange('edit_company', {});
  }

  render() {
    const id = parseInt(this.props.match.params.orgId, 10);
    const actions = [{appearance: '_basic-danger', text: 'Delete', onClick: this.delete}];

    if (this.props.name.value) {
      actions.push({appearance: '_basic-primary', text: 'Update', onClick: this.update});
    }

    const links = [
      {text: 'General', to: `/${id}/company-settings/general`},
      {text: 'Users', to: `/${id}/company-settings/users`},
      {text: 'Conversations', to: `/${id}/company-settings/conversations`},
    ];

    return <Modal
      title="Edit company"
      wrapClassName={style.wrapper}
      className={style.modal}
      actions={actions}
      close={this.close}
    >
      <Navigation actions={links} className={style.navigation} />

      <div className={style.logo}>
        <OrganizationIcon
          icon={this.props.logo.value}
          color={this.props.color.value}
          name={this.props.name.value}
          className={style.preview}
        />

        <File
          model="edit_company.logo"
          defaultValue={this.props.organization.icon}

          validations={[
            {
              action: Validators.fileMaxSize(200000),
              text: this.props.t('file_max_size', { type: this.props.t('image'), count: 200, unit: this.props.t('kb') }),
            },

            {
              action: Validators.fileExtensions(['jpeg', 'png']),
              text: this.props.t('file_extensions', { extensions: '"jpeg", "png"' }),
            },

            {
              action: Validators.fileType('image'),
              text: this.props.t('file_type', { type: this.props.t('image') }),
            },
          ]}
        >
          <Button
            appearance="_basic-divider"
            text="Upload logo"
            icon="plus"
            type="button"
            className={style.upload_button}
          />
        </File>
      </div>

      <div className={style.colors}>
        <button type="button" className={style.circle} data-color="none" onClick={this.setColor('')} />
        <button type="button" className={style.circle} data-color="blue" onClick={this.setColor('blue')} />
        <button type="button" className={style.circle} data-color="green" onClick={this.setColor('green')} />
        <button type="button" className={style.circle} data-color="pink" onClick={this.setColor('pink')} />
      </div>

      <Input
        model="edit_company.name"
        placeholder="Company name"
        defaultValue={this.props.organization.name}
        className={style.input}

        validations={[
          {
            action: Validators.required,
            text: this.props.t('validation_required', { field: this.props.t('name') }),
          },
        ]}
      />
    </Modal>;
  }
}

export default compose(
  withRouter,
  withTranslation(),

  connect(
    (state, props) => ({
      organization: state.organizations.list[parseInt(props.match.params.orgId, 10)],

      color: get(state.forms, 'edit_company.color', {
        error: '',
        value: '',
        isTouched: false,
        isBlured: false,
        isRequired: true,
      }),

      name: get(state.forms, 'edit_company.name', {
        error: '',
        value: '',
        isTouched: false,
        isBlured: false,
        isRequired: true,
      }),

      logo: get(state.forms, 'edit_company.logo', {
        error: '',
        value: '',
        isTouched: false,
        isBlured: false,
        isRequired: true,
      }),
    }),

    {
      formChange: formActions.formChange,
      updateOrganization: organizationsActions.updateOrganization,
      showNotification: notificationActions.showNotification,
    },
  ),
)(General);
