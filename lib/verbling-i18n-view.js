'use babel';

export default class VerblingI18nView {

  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('verbling-i18n');

    // gets selected text from editor
    editor = atom.workspace.getActiveTextEditor();
    selection = editor.getLastSelection()
    selectionRange = selection.getBufferRange()
    text = selection.getText()
    // get project path
    const paths = atom.project.getPaths();

    newText = `Yes! ${text} !!, path: ${paths[0]}`;

    // Create message element
    const message = document.createElement('div');
    message.textContent = `The Verbling I18n package is Alive! ${newText}`;
    message.classList.add('message');
    this.element.appendChild(message);


    // replaces the selected text with another text
    editor.setTextInBufferRange(selectionRange, message.textContent)

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
