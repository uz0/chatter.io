import React, { Component } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames/bind';
import compose from 'recompose/compose';
import isEmpty from 'lodash/isEmpty';
import { withTypings } from '@/hoc';
import style from './style.css';

const cx = classnames.bind(style);

class Typings extends Component {
  componentWillReceiveProps(nextProps) {
    const isTypingsHasBeenShown = isEmpty(this.props.typings) && !isEmpty(nextProps.typings);

    if (isTypingsHasBeenShown) {
      const messagesScrollElement = document.getElementById('messages-scroll');
      const isScrolledToBottom = messagesScrollElement && messagesScrollElement.scrollTop === (messagesScrollElement.scrollHeight - messagesScrollElement.offsetHeight);

      if (isScrolledToBottom) {
        setTimeout(() => messagesScrollElement.scrollTo(0, messagesScrollElement.scrollHeight));
      }
    }
  }

  render() {
    return <p className={cx('typings', this.props.className, {'_is-typing': this.props.typings})}>
      {this.props.typings &&
        this.props.typings
      }
    </p>;
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
