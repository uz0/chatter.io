import { render } from 'react-dom';
import { actions as storeActions } from '@/store';
import routes from '@/routes';
import store from '@/store';
import mobileDetect from 'mobile-detect';

import 'normalize.css';
import './style/index.css';
import './i18n';

window.version = 9;

const md = new mobileDetect(window.navigator.userAgent);
const isMobile = !!md.mobile();

store.dispatch(storeActions.setDevice(isMobile ? 'touch' : 'desktop'));

const init = () => render(
  routes(),
  document.getElementById('app'),
);

const api = window.UniversaChatApi({ token: process.env.TOKEN }, {
  onInitialized() {
    const authToken = window.localStorage.getItem('authToken');

    if (!authToken) {
      init();
      return;
    }

    api.login({ auth_token: authToken }).then(data => {
      store.dispatch(storeActions.setCurrentUser(data.user));
      init();
    });
  },
});

export { isMobile, api };
