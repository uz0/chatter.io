import React, { Component } from 'react';
import SidebarPanel from '@/components/sidebar-panel';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

class CompanySettings extends Component {
  render() {
    return <div className={cx('settings', this.props.className)}>
      <SidebarPanel className={style.sidebar} />
      <div className={style.content} />
    </div>;
  }
}

export default CompanySettings;
