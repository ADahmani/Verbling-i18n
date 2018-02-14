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
      fileName: '',
      subKeys: '',
      raw: '',
      activeItem: {}
    };
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
   * Magic box input handeler
   * @param  {Object} e on change text event
   */
  onInputChange = e => {
    var raw = e.target.value;
    var copyInput = (' ' + raw).slice(1);
    const values = copyInput.split('/');
    const fileName = values[0];
    const objectKV = values[1];

    this.setState({
      activeItemName: fileName,
      raw,
      objectKV
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
        raw: fileName.split('.').shift(),
        activeItemName: fileName.split('.').shift()
      },
      this.toggleActiveItem(`${fileName}.json`)
    );
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
            <h3>{__t('common.normalText')}</h3>
            <I18N __t="common.generatedHtml">
              <h3>Magic input box:</h3>
            </I18N>
            <input
              type="text"
              className="native-key-bindings" // backspace won't work w/o this
              style={{width: '70%'}}
              value={this.state.raw}
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
