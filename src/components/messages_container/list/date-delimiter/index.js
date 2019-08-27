import React, { Component } from 'react';
import compose from 'recompose/compose';
import { withTranslation } from 'react-i18next';
import classnames from 'classnames/bind';
import moment from 'moment';
import style from './style.css';

const cx = classnames.bind(style);

class DateDelimiter extends Component {
  render() {
    let date;

    if (moment(this.props.date).startOf('day').diff(moment().startOf('day'), 'days') === 0) {
      date = this.props.t('today');
    } else {
      date = moment(this.props.date).format('MMMM, DD');
    }

    return <p className={cx('date', this.props.className)}>{ date }</p>;
  }
}

export default compose(
  withTranslation(),
)(DateDelimiter);
