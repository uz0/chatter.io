import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';

import IndexRedirect from '@/components/index-redirect';
import Layout from '@/components/layout';
import SignIn from '@/components/auth/sign-in_container';
import SignUp from '@/components/auth/sign-up_container';
import ForgotPassword from '@/components/auth/forgot-password_container';
import Chat from '@/components/chat_container';
import Invite from '@/components/invite';
import NewCompany from '@/components/new-company';
import CompanySettings from '@/components/company-settings';
import GeneralSettings from '@/components/company-settings/general';
import UsersSettings from '@/components/company-settings/users';
import ConversationsSettings from '@/components/company-settings/conversations';

import store from '@/store';

export default () => <Provider store={store}>
  <BrowserRouter>
    <Layout>
      <Switch>
        <Route exact component={IndexRedirect} path="/" />
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
        <Route component={Invite} path="/invite/:code" />
        <Route component={Invite} path="/joinuser/:nick" />
        <Route component={SignIn} path="/sign-in" />
        <Route component={SignUp} path="/sign-up" />
        <Route component={ForgotPassword} path="/forgot-password" />

        <CompanySettings>
          <Switch>
            <Route component={GeneralSettings} path="/:orgId/company-settings/general" />
            <Route component={UsersSettings} path="/:orgId/company-settings/users" />
            <Route component={ConversationsSettings} path="/:orgId/company-settings/conversations" />
          </Switch>
        </CompanySettings>
      </Switch>
    </Layout>
  </BrowserRouter>
</Provider>;