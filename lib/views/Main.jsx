'use babel';

import React from 'react';
import I18nView from './I18nView.jsx';

export default class Main extends React.Component {
  render() {
    return (
      <div className="verbling-i18n">
        <h1
          style={{
            marginTop: 0,
            display: 'inline-block'
          }}
        >
          🌍 Verbling I18n Toolkit 🎉
        </h1>
        <button onClick={() => this.props.close()} className="btn btn-error" style={{float: 'right'}}>
          <div
            style={{
              marginLeft: 3,
              marginTop: 5
            }}
            className="icon icon-x"
          />
        </button>
        <I18nView {...this.props} />
      </div>
    );
  }
}
