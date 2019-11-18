import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import SidebarPanel from '@/components/sidebar-panel';
import Form from '@/components/old-form/form';
import ModalContainer from '@/components/section_container';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

class CompanySettings extends Component {
  render() {
    return <div className={cx('settings', this.props.className)}>
      <SidebarPanel className={style.sidebar} />

      {this.props.isLoaded &&
        <Form model="edit_company" className={cx('content', {'_is-hidden': this.props.isModalsShown})}>
          {this.props.children}
        </Form>
      }

      <ModalContainer className={style.modal_wrapper} />
    </div>;
  }
}

export default compose(
  connect(
    state => ({
      isLoaded: state.organizations.isLoaded,
      isModalsShown: state.modal.ids.indexOf('invite-company-modal') !== -1 || state.modal.ids.indexOf('new-company-dialog-modal') !== -1,
    }),
  ),
)(CompanySettings);
