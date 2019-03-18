import React from 'react';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory, IndexRedirect } from 'react-router';

import Layout from '@/layout';

import SignIn from '@/components/sign-in_container';
import SignUp from '@/components/sign-up_container';
import ForgotPassword from '@/components/forgot-password_container';
import Chat from '@/components/chat_container';
import Invite from '@/components/invite';

import store from '@/store';

export default () => <Provider store={store}>
  <Router history={browserHistory}>
    <Route path="/" component={Layout}>
      <IndexRedirect to="chat" />
      <Route component={Chat} path="chat" />
      <Route component={Chat} path="chat/user/:userId" />
      <Route component={Chat} path="chat/user/:userId/:messageId" />
      <Route component={Chat} path="chat/:chatId" />
      <Route component={Chat} path="chat/:chatId/:messageId" />
      <Route component={Invite} path="invite/:code" />
      <Route component={SignIn} path="sign-in" />
      <Route component={SignIn} path="sign-in/:code" />
      <Route component={SignUp} path="sign-up" />
      <Route component={SignUp} path="sign-up/:code" />
      <Route component={ForgotPassword} path="/forgot-password" />
    </Route>
  </Router>
</Provider>;
