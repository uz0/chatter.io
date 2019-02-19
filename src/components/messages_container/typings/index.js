import React, { Component } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import isEmpty from 'lodash/isEmpty';
import { withTypings } from '@/hoc';
import style from './style.css';

class Typings extends Component {
  render() {
    return !isEmpty(this.props.typings) &&
      <p className={style.typings}>{this.props.typings}</p>;
  }
}

export default compose(
  connect(
    (state, props) => ({
      details: state.subscriptions.list[props.subscription_id],
    }),
  ),

  withTypings(props => ({
    chat: props.details,
  })),
)(Typings);
