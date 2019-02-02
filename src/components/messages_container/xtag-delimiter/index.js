import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

// <span>efim1382</span> has been added

class Xtag extends Component {
  render() {
    return <p className={cx('xtag', this.props.className)}>
      {this.props.message.text}
    </p>;
  }
}

export default compose(
  connect(
    (state, props) => ({
      message: state.messages.list[props.id],
    }),
  ),
)(Xtag);
