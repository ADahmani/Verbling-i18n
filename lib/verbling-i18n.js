'use babel';

import VerblingI18nView from './verbling-i18n-view';
import {CompositeDisposable} from 'atom';
import React from 'react';
import ReactDom from 'react-dom';
import Main from './views/Main.jsx';
import season from 'season';
import fs from 'fs';

let root;
let panel;

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
  onChangeText(newText) {
    this.newText = newText;
    this.isDynamic = true;
  },
  close() {
    ReactDom.unmountComponentAtNode(root);
    panel.destroy();
  },
  execute(fileName, subKeys) {
    /**
     * Used when firing the BOOM button
     * @param  {String} fileName file we want to play with
     * @param  {String} subKeys  keys and subkeys to add
     */
    //
    editor = atom.workspace.getActiveTextEditor();
    selection = editor.getLastSelection();
    selectionRange = selection.getBufferRange();
    textWeWant = selection.getText();
    newText = this.newText;
    this.projectPath = atom.project.getPaths()[0];
    const fileToRead = this.projectPath + '/lib/i18n/en/' + fileName;
    const isDynamic = this.isDynamic;

    // Checks if file exists and creates it if not
    if (!season.resolve(fileToRead)) {
      season.writeFileSync(fileToRead, {});
    }

    // Reads a json file; edits it; save it; and replace text in atom with
    // the right value
    season.readFile(fileToRead, function(err, file) {
      file = addPropsToFile(file, subKeys, newText || textWeWant);
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
            `{__t('${fileName.slice(0, -5)}.${subKeys}')}`
          );
        }
      });
    });
    this.newText = '';
    this.isDynamic = false;
    this.close();
  },
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
  deactivate() {
    // Nuke
    this.subscriptions.dispose();
    ReactDom.unmountComponentAtNode(root);
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
    this.i18nPath = this.projectPath + '/lib/i18n/en';
    this.filenames = fs.readdirSync(this.i18nPath);
    editor = atom.workspace.getActiveTextEditor();
    selection = editor.getLastSelection();
    selectionRange = selection.getBufferRange();
    this.selectedText = selection.getText();
    ReactDom.render(
      <Main
        atom={atom}
        filenames={this.filenames}
        execute={this.execute}
        selectedText={this.selectedText}
        onChangeText={this.onChangeText}
        close={this.close}
      />,
      root
    );

    panel = atom.workspace.addBottomPanel({item: root, visible: false});
    return panel.isVisible() ? panel.hide() : panel.show();
  }
};
