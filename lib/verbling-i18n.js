'use babel';

import VerblingI18nView from './verbling-i18n-view';
import {CompositeDisposable, BufferedProcess} from 'atom';
import React from 'react';
import ReactDom from 'react-dom';
import ReactDOMServer from 'react-dom/server';
import Main from './views/Main.jsx';
import season from 'season';
import fs from 'fs';
import {Trans, I18nextProvider} from 'react-i18next';
import i18next from './i18n/I18N.jsx';
import textToReactMarkup from 'react-html-parser';

let root;
let panel;
let lastFileName = '';
let newComplexKey = '';

/**
 * Gets the html string we want to the key to
 * @param  {String} text html string
 */
const runFindTransation = function(text) {
  text = (text && text.replace(/\s+/g, ' ').trim()) || '';
  const i18nInstance = i18next('en', {
    debug: true,
    saveMissing: true,
    missingKeyHandler: (lng, ns, key, fallbackValue) => {
      newComplexKey = fallbackValue;
    }
  });
  const app = {
    i18next: i18nInstance,
    __t: (key, i18nData = {}) => {
      return i18nInstance.t(key, i18nData);
    }
  };
  let html = textToReactMarkup(text);
  const x = ReactDOMServer.renderToStaticMarkup(
    <Trans i18n={app.i18next} t={app.__t} parent={'span'}>
      {html}
    </Trans>
  );

  atom.notifications.addSuccess('Markup generated!', {
    detail: newComplexKey
  });
};
/**
 * Adds keys and subkeys to JSON
 * @param  {Object} obj     json file
 * @param  {String} subKeys subKeys dot seperated
 * @param  {String} val     value of key
 * @return {Object}         returns new file
 */
const addPropsToFile = function(obj, subKeys, val) {
  if (typeof subKeys == 'string') subKeys = subKeys.split('.');

  obj[subKeys[0]] = obj[subKeys[0]] || {};

  var tmpObj = obj[subKeys[0]];

  if (subKeys.length > 1) {
    subKeys.shift();
    addPropsToFile(tmpObj, subKeys, val);
  } else obj[subKeys[0]] = val;

  return obj;
};

/**
 * Main Controller
 * @type {Object}
 */
export default {
  subscriptions: null,
  selectedText: '',
  isDynamic: false,
  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();
    // Register command that toggles this view
    this.subscriptions.add(
      atom.commands.add('atom-workspace', {
        'verbling-i18n:toggle': () => this.toggle()
      })
    );
  },
  onClickGenerateKey(text) {
    this.isDynamic = true;
    runFindTransation(text);
  },
  close() {
    ReactDom.unmountComponentAtNode(root);
    panel.destroy();
  },
  handleEscKey(e) {
    if (e.keyCode == 27) {
      this.close();
    }
  },
  execute(fileName, subKeys) {
    /**
     * Used when firing the BOOM button
     * @param  {String} fileName file we want to play with
     * @param  {String} subKeys  keys and subkeys to add
     */
    //
    lastFileName = fileName.slice(0, -5);
    editor = atom.workspace.getActiveTextEditor();
    selection = editor.getLastSelection();
    selectionRange = selection.getBufferRange();
    textWeWant = selection
      .getText()
      .replace(/\s+/g, ' ')
      .trim();
    this.projectPath = atom.project.getPaths()[0];
    const fileToRead = this.projectPath + '/i18n/en/' + fileName;
    const isDynamic = this.isDynamic;

    // Checks if file exists and creates it if not
    if (!season.resolve(fileToRead)) {
      season.writeFileSync(fileToRead, {});
    }

    // Reads a json file; edits it; save it; and replace text in atom with
    // the right value
    season.readFile(fileToRead, (err, file) => {
      let text = isDynamic ? newComplexKey : textWeWant;
      file = addPropsToFile(file, subKeys, text);
      season.writeFile(fileToRead, file, function(err) {
        if (err) console.error(err);
        if (isDynamic) {
          editor.setTextInBufferRange(
            selectionRange,
            `<I18N __t="${fileName.slice(0, -5)}.${subKeys}">
                ${textWeWant}
              </I18N>`
          );
        } else {
          editor.setTextInBufferRange(
            selectionRange,
            `{app.__t('${fileName.slice(0, -5)}.${subKeys}')}`
          );
        }
        newComplexKey = '';
      });
    });
    this.isDynamic = false;
    this.close();
  },
  deactivate() {
    // Nuke
    this.subscriptions.dispose();
    ReactDom.unmountComponentAtNode(root);
    root.removeEventListener('keydown', this.handleEscKey.bind(this), false);
    panel.destroy();
  },

  serialize() {
    // Serialize in case we want to save state after closing (we don't)
    return {};
  },

  toggle() {
    // Executed when using the hot keys ctrl + opt + o
    // Basically it starts the plugin and mount it
    root = document.createElement('div');
    this.projectPath = atom.project.getPaths()[0];
    this.i18nPath = this.projectPath + '/i18n/en';
    this.filenames = fs.readdirSync(this.i18nPath);
    editor = atom.workspace.getActiveTextEditor();
    selection = editor.getLastSelection();
    selectionRange = selection.getBufferRange();
    this.selectedText = selection.getText();
    ReactDom.render(
      <Main
        atom={atom}
        filenames={this.filenames}
        lastFileName={lastFileName}
        execute={this.execute}
        selectedText={this.selectedText}
        onClickGenerateKey={this.onClickGenerateKey}
        close={this.close}
      />,
      root
    );

    // Creates a modal and attach view to it
    panel = atom.workspace.addModalPanel({
      item: root,
      visible: false,
      autoFocus: true
    });

    // Adds support to exit modal on esc press
    root.addEventListener('keydown', this.handleEscKey.bind(this), false);

    return panel.isVisible() ? panel.hide() : panel.show();
  }
};
