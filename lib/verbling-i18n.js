'use babel';

import VerblingI18nView from './verbling-i18n-view';
import {CompositeDisposable} from 'atom';

export default {
  verblingI18nView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.verblingI18nView = new VerblingI18nView(state.verblingI18nViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.verblingI18nView.getElement(),
      visible: false
    });

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
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.verblingI18nView.destroy();
  },

  serialize() {
    return {
      verblingI18nViewState: this.verblingI18nView.serialize()
    };
  },

  toggle() {
    return this.modalPanel.isVisible()
      ? this.modalPanel.hide()
      : this.modalPanel.show();
  }
};
