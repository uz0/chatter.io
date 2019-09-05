import React, { Component } from 'react';
import SidebarPanel from '@/components/sidebar-panel';
import Content from './content';
import style from './style.css';

class NewCompany extends Component {
  render() {
    return <div className={style.new}>
      <SidebarPanel className={style.sidebar} />
      <Content className={style.content} />
    </div>;
  }
}

export default NewCompany;
