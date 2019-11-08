import React, { Component } from 'react';
import SidebarPanel from '@/components/sidebar-panel';
import Sidebar from '@/components/sidebar_container';
import Content from './content';
import style from './style.css';

class NewSpace extends Component {
  render() {
    return <div className={style.new}>
      <SidebarPanel className={style.panel} />
      <Sidebar className={style.sidebar} />
      <Content className={style.content} />
    </div>;
  }
}

export default NewSpace;
