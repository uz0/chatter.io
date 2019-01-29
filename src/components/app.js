import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory, IndexRedirect } from 'react-router';

import Layout from '@/components/layout';

import SignIn from '@/components/sign-in_container';
import SignUp from '@/components/sign-up_container';
import ForgotPassword from '@/components/forgot-password_container';
import Chat from '@/components/chat_container';

import store from '@/store';

export default class App extends Component {
  render() {
    return <Provider store={store}>
      <Router history={browserHistory}>
        <Route path="/" component={Layout}>
          <IndexRedirect to="chat" />
          <Route component={Chat} path="chat" />
          <Route component={SignIn} path="sign-in" />
          <Route component={SignIn} path="sign-in/:code" />
          <Route component={SignUp} path="sign-up" />
          <Route component={SignUp} path="sign-up/:code" />
          <Route component={ForgotPassword} path="/forgot-password" />
        </Route>
      </Router>
    </Provider>;
  }
}
