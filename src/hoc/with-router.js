import React, { Component } from 'react';
import compose from 'recompose/compose';
import { withRouter } from 'react-router';

export default WrappedComponent => {
  class Wrapped extends Component {
    pushUrl = (url, query) => {
      let search = '';

      if (!query) {
        search = this.props.location.search;
      }

      if (query === null) {
        search = '';
      }

      if (query) {
        search = '?' + Object.keys(query).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`).join('&');
      }

      this.props.history.push(`${url}${search}`);
    };

    replaceUrl = (url, query) => {
      let search = '';

      if (!query) {
        search = this.props.location.search;
      }

      if (query === null) {
        search = '';
      }

      if (query) {
        search = '?' + Object.keys(query).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`).join('&');
      }

      this.props.history.repalce(`${url}${search}`);
    };

    render() {
      return <WrappedComponent pushUrl={this.pushUrl} replaceUrl={this.replaceUrl} {...this.props} />;
    }
  }

  return compose(
    withRouter,
  )(Wrapped);
};
