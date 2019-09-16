import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import SidebarPanel from '@/components/sidebar-panel';
import Form from '@/components/form/form';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

class CompanySettings extends Component {
  render() {
    return <div className={cx('settings', this.props.className)}>
      <SidebarPanel className={style.sidebar} />

      {this.props.isLoaded &&
        <Form model="edit_company" className={style.content}>
          {this.props.children}
        </Form>
      }
    </div>;
  }
}

export default compose(
  connect(
    state => ({
      isLoaded: state.organizations.isLoaded,
    }),
  ),
)(CompanySettings);
