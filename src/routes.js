import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import { Provider } from 'react-redux';

import Layout from '@/components/layout';
import SignIn from '@/components/sign-in_container';
import SignUp from '@/components/sign-up_container';
import ForgotPassword from '@/components/forgot-password_container';
import Chat from '@/components/chat_container';
import Invite from '@/components/invite';
import NewCompany from '@/components/new-company';
import CompanySettings from '@/components/company-settings';

import store from '@/store';

export default () => <Provider store={store}>
  <BrowserRouter>
    <Layout>
      <Switch>
        <Route component={Chat} path="/:orgId/chat/user/:userId/tag/:tagname" />
        <Route component={Chat} path="/chat/user/:userId/tag/:tagname" />
        <Route component={Chat} path="/:orgId/chat/user/:userId/:messageId" />
        <Route component={Chat} path="/chat/user/:userId/:messageId" />
        <Route component={Chat} path="/:orgId/chat/user/:userId" />
        <Route component={Chat} path="/chat/user/:userId" />
        <Route component={Chat} path="/:orgId/chat/:chatId/tag/:tagname" />
        <Route component={Chat} path="/chat/:chatId/tag/:tagname" />
        <Route component={Chat} path="/:orgId/chat/:chatId/:messageId" />
        <Route component={Chat} path="/chat/:chatId/:messageId" />
        <Route component={Chat} path="/:orgId/chat/:chatId" />
        <Route component={Chat} path="/chat/:chatId" />
        <Route component={Chat} path="/:orgId/chat" />
        <Route component={Chat} path="/chat" />
        <Route component={NewCompany} path="/new-company" />
        <Route component={CompanySettings} path="/:orgId/company-settings" />
        <Route component={Invite} path="/invite/:code" />
        <Route component={Invite} path="/joinuser/:nick" />
        <Route component={SignIn} path="/sign-in" />
        <Route component={SignUp} path="/sign-up" />
        <Route component={ForgotPassword} path="/forgot-password" />
        <Redirect to="/chat" />
      </Switch>
    </Layout>
  </BrowserRouter>
</Provider>;