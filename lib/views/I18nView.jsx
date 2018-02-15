'use babel';

import React from 'react';
import atom from 'atom';
import {Scrollbars} from 'react-custom-scrollbars';

export default class I18nView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filenames: props.filenames,
      selectedText: props.selectedText,
      activeItemName: '',
      fileName: props.lastFileName && (props.lastFileName + '.json'),
      subKeys: '',
      raw: props.lastFileName && (props.lastFileName + '.'),
      activeItem: {}
    };
  }

  componentDidMount() {
    this.nameInput.focus();
  }

  /**
   * Toggle the selected file and highlight it
   * @param  {String} fileName File name
   */
  toggleActiveItem = fileName => {
    this.setState({
      activeItem: {[fileName]: true},
      fileName
    });
    this.setState({activeItemName: fileName.split('.').shift()});
  };

  /**
   * Checks if key pressed is Enter and execute
   * @param  {Event} e event
   */
  onKeyPress = e => {
    var keycode = e.keyCode ? e.keyCode : e.which;
    if (keycode == '13') {
      this.execute();
    }
  };

  /**
   * Magic box input handeler
   * @param  {Object} e on change text event
   */
  onInputChange = e => {
    var raw = e.target.value;
    var copyInput = (' ' + raw).slice(1);
    var objectKV = copyInput.split('.');
    const fileName = objectKV.shift();
    objectKV = objectKV.join('.');
    this.setState({
      activeItemName: fileName,
      raw,
      objectKV,
      isValid: fileName ? this.props.filenames.includes(fileName + '.json') : false
    });
    this.toggleActiveItem(`${fileName}.json`);
  };

  /**
   * On select file from the list
   * @param  {String} fileName File name
   */
  onSelectFile = fileName => {
    this.setState(
      {
        raw: fileName.split('.').shift() + '.',
        activeItemName: fileName.split('.').shift(),
        isValid: true
      },
      this.toggleActiveItem(`${fileName}.json`)
    );
    this.nameInput.focus();
  };

  /**
   * Value box input handeler
   * @param  {Object} e change value event
   */
  onValueChange = e => {
    const selectedText = e.target.value;
    this.setState({
      selectedText
    });
    this.props.onChangeText(selectedText);
  };

  /**
   * Fired when clicking the BOOM button
   */
  execute = () => {
    this.props.execute(this.state.fileName, this.state.objectKV);
    this.props.close();
  };

  render() {
    let i = 0;
    var files = this.props.filenames.map(file => {
      return (
        <li
          className={
            this.state.activeItem[file] ? 'list-item selected' : 'list-item'
          }
          style={{marginLeft: 10}}
          key={i++}
        >
          <div
            onClick={e => this.onSelectFile(file)}
            className="icon icon-file-text"
          >
            {file}
          </div>
        </li>
      );
    });
    return (
      <div
        style={{padding: '10px', width: '100%'}}
        className="flex flex-direction-column"
      >
        <div className="flex flex-1">
          <div className="form-group flex-1">
            <h3>Magic input box:</h3>
            {!this.state.isValid &&
              this.state.activeItemName !== '' &&
              <div
                style={{
                  color: 'orange',
                  padding: 10,
                  position: 'absolute',
                  bottom: 0,
                  fontSize: 13,
                  left: 40
                }}
              >{`⚠️ File "${this.state.activeItemName}.json" will be created!`}</div>}
            <input
              type="text"
              ref={input => {
                this.nameInput = input;
              }}
              autofocus
              className="native-key-bindings" // backspace won't work w/o this
              style={{width: '70%'}}
              value={this.state.raw}
              onKeyPress={this.onKeyPress}
              onChange={this.onInputChange}
            />
            <button
              style={{width: '30%'}}
              className="btn btn-default"
              onClick={this.execute}
            >
              💥 BOOOM!
            </button>
          </div>
        </div>
        <div className="flex flex-1">
          <div className="flex-1">
            <h3>
              Selected file
            </h3>
            <div style={{padding: '0 10px'}}>
              <div className="icon icon-file-directory">en</div>
              <Scrollbars style={{height: 100}}>
                <ul className="list-group">
                  {files}
                </ul>
              </Scrollbars>
            </div>
          </div>
          <div class="form-group flex-1">
            <h3>
              Selected value
            </h3>
            <textarea
              onChange={this.onValueChange}
              className="form-control native-key-bindings"
              rows="5"
            >
              {this.state.selectedText}
            </textarea>
          </div>
        </div>
      </div>
    );
  }
}
