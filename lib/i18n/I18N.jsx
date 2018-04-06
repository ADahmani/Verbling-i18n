'use babel';
import i18ne from 'i18next';
import i18n from 'i18n';
import {reactI18nextModule} from 'react-i18next';

export const getI18NextBundle = () => {
  const resources = {};
  return resources;
};

const resources = getI18NextBundle();

/**
 * Create a i18next instance with locale
 * @param  {String} locale String locale
 * @return {I18Next}       I18Next instance
 */
export default (locale = 'en', options = {}) => {
  const i18next = i18ne.createInstance();

  i18next.on('missingKey', (lngs, namespace, key, res) => {
    console.log('Missing key:', namespace, key);
  });

  i18next.use(reactI18nextModule).init({
    lng: locale,
    lowerCaseLng: true,
    interpolation: {
      escapeValue: false // not needed for react!!
    },
    resources,
    debug: false,
    react: {
      defaultTransParent: 'span'
    },
    ...options
  });

  return i18next;
};
