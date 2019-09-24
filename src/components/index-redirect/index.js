import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';

class IndexRedirect extends Component {
  componentWillMount() {
    if (this.props.currentUser) {
      this.props.history.replace('/chat');
      return;
    }

    this.props.history.replace('/sign-in');
  }

  render() {
    return <div />;
  }
}

export default compose(
  connect(
    state => ({
      currentUser: state.currentUser,
    }),
  ),
)(IndexRedirect);
