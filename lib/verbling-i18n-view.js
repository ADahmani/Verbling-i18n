'use babel';

// Using React instead of this
export default class VerblingI18nView {

  constructor(serializedState) {

  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

}
