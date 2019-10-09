import React from 'react';
import { render } from 'react-dom';
import { actions as storeActions } from '@/store';
import Routes from '@/routes';
import store from '@/store';
import mobileDetect from 'mobile-detect';

import 'normalize.css';
import './style/index.css';
import './i18n';

window.version = 15;

const md = new mobileDetect(window.navigator.userAgent);
const isMobile = !!md.mobile();

store.dispatch(storeActions.setDevice(isMobile ? 'touch' : 'desktop'));

const init = () => render(
  <Routes />,
  document.querySelector('#app'),
);

let api;
const apiArguments = { token: process.env.TOKEN };

const localInterface = {
  async onInitialized() {
    const authToken = window.localStorage.getItem('authToken');

    if (!authToken) {
      init();
      return;
    }

    try {
      const loginResponse = await api.login({ auth_token: authToken });
      store.dispatch(storeActions.setCurrentUser(loginResponse.user));
      init();
    } catch (error) {
      store.dispatch(storeActions.setError({
        details: error,

        request: {
          name: 'login',
          arguments: { auth_token: authToken },
        },
      }));

      init();
    }
  },

  onDisconnected() {
    console.log('------------');
    console.log('disconnected');
    console.log('------------');
  },
};

try {
  api = window.UniversaChatApi(apiArguments, localInterface);
} catch (error) {
  store.dispatch(storeActions.setError({
    details: error,

    request: {
      name: 'UniversaChatApi',
      arguments: apiArguments,
    },
  }));

  init();
}

export { isMobile, api };
