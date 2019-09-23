import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import classnames from 'classnames/bind';
import { withDetails } from '@/hoc';
import Header from './header';
import MessageInput from './input';
import List from './list';
import Typings from './typings';
import inputActions from './input/actions';
import style from './style.css';

const cx = classnames.bind(style);

class Messages extends Component {
  shouldComponentUpdate(nextProps) {
    const isChatChanged = this.props.details.id !== nextProps.details.id;
    const isChatNameChanged = this.props.details.group.name !== nextProps.details.group.name;
    const isClassNameChanged = this.props.className !== nextProps.className;

    return isChatChanged || isChatNameChanged || isClassNameChanged;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.details.id !== nextProps.details.id) {
      if (nextProps.details.draft) {
        this.props.setText(nextProps.details.draft);
      } else {
        this.props.reset();
      }
    }
  }

  componentDidMount() {
    if (this.props.details.draft) {
      this.props.setText(this.props.details.draft);
    }
  }

  render() {
    return <div className={cx('messages', this.props.className)}>
      <Header
        chatId={this.props.details.id}
        className={style.header}
      />

      <List
        details_id={this.props.details.id}
        className={style.list}
      />

      <Typings
        subscription_id={this.props.details.id}
        className={style.typings}
      />

      {this.props.details.role !== 'ro' &&
        <MessageInput
          subscription_id={this.props.details.id}
          className={style.input}
        />
      }
    </div>;
  }
}

export default compose(
  withDetails,

  connect(
    null,

    {
      setText: inputActions.setText,
      reset: inputActions.reset,
    },
  ),
)(Messages);