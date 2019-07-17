import i18n from 'i18next';
import { en, ru } from '../i18n';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  debug    : true,
  lng      : 'en',
  react    : {defaultTransParent: 'div', wait: true},
  resources: {en, ru},
});

export default i18n;
