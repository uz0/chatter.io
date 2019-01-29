import { render } from 'react-dom';
import { actions as storeActions } from '@/store';
import routes from '@/routes';
import store from '@/store';

import 'normalize.css';
import './style/index.css';
import './i18n';

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

export { api };
