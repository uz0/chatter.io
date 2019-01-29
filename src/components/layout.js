import React, { Fragment } from 'react';
import Notification from '@/components/notification';

const Layout = ({ children }) => <Fragment>
  { children }
  <Notification />
</Fragment>;

export default Layout;
