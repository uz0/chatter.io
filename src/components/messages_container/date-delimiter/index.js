import React, { Component } from 'react';
import compose from 'recompose/compose';
import { withNamespaces } from 'react-i18next';
import classnames from 'classnames/bind';
import moment from 'moment';
import style from './style.css';

const cx = classnames.bind(style);

class DateDelimiter extends Component {
  render() {
    return <p className={cx('date', this.props.className)}>
      {moment(this.props.date).startOf('day').diff(moment().startOf('day'), 'days') === 0 ?
        this.props.t('today') :
        moment(this.props.date).format('MMMM, DD')}
    </p>;
  }
}

export default compose(
  withNamespaces('translation'),
)(DateDelimiter);
