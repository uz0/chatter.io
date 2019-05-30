import { render } from 'react-dom';
import { actions as storeActions } from '@/store';
import routes from '@/routes';
import store from '@/store';
import mobileDetect from 'mobile-detect';
import testData from '@/__tests__/__data__';

import 'normalize.css';
import './style/index.css';
import './i18n';

window.version = 13;

const md = new mobileDetect(window.navigator.userAgent);
const isMobile = !!md.mobile();

if (store) {
  store.dispatch(storeActions.setDevice(isMobile ? 'touch' : 'desktop'));
}

const target = document.getElementById('app');

const init = () => target && render(
  routes(),
  target,
);

let api;
const apiArguments = { token: process.env.TOKEN };

const localInterface = {
  onInitialized() {
    const authToken = window.localStorage.getItem('authToken');

    if (!authToken) {
      init();
      return;
    }

    try {
      api.login({ auth_token: authToken }).then(data => {
        store.dispatch(storeActions.setCurrentUser(data.user));
        init();
      });
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
  if (store) {
    store.dispatch(storeActions.setError({
      details: error,

      request: {
        name: 'UniversaChatApi',
        arguments: apiArguments,
      },
    }));

    init();
  }
}

if (!api) {
  api = testData.UniversaChatApi();
}

export { isMobile, api };
