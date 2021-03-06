import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import { Provider } from 'react-redux';

import Layout from '@/components/layout';
import SignIn from '@/components/sign-in_container';
import SignUp from '@/components/sign-up_container';
import ForgotPassword from '@/components/forgot-password_container';
import Chat from '@/components/chat_container';
import Invite from '@/components/invite';

import store from '@/store';

export default () => <Provider store={store}>
  <BrowserRouter>
    <Layout>
      <Switch>
        <Route component={Chat} path="/chat/user/:userId/:messageId" />
        <Route component={Chat} path="/chat/user/:userId" />
        <Route component={Chat} path="/chat/:chatId/:messageId" />
        <Route component={Chat} path="/chat/:chatId" />
        <Route component={Chat} path="/chat" />
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
