import React, { Component } from 'react';
import compose from 'recompose/compose';
import classnames from 'classnames/bind';
import Input from './input';
import List from './list';
import { withDetails } from '@/hoc';
import style from './style.css';

const cx = classnames.bind(style);

class Feed extends Component {
  shouldComponentUpdate(nextProps) {
    const isChatChanged = this.props.details.id !== nextProps.details.id;
    const isChatNameChanged = this.props.details.group.name !== nextProps.details.group.name;

    return isChatChanged || isChatNameChanged;
  }

  render() {
    return <div className={cx('feed', this.props.className)}>
      <h3 className={style.title}>#{this.props.details.group.name}</h3>
      <p className={style.subtitle}>Public space</p>

      <Input details_id={this.props.details.id} className={style.input_container} />
      <List details_id={this.props.details.id} />
    </div>;
  }
}

export default compose(
  withDetails,
)(Feed);
