import React, { Component } from 'react';
import compose from 'recompose/compose';
import classnames from 'classnames/bind';
import { withNamespaces } from 'react-i18next';
import Icon from '@/components/icon';
import style from './style.css';

const cx = classnames.bind(style);

class SearchInput extends Component {
  render() {
    return <div className={cx('wrapper', this.props.className)}>
      <Icon name="search" />
      <input type="text" placeholder={this.props.placeholder || this.props.t('search')} />
    </div>;
  }
}

export default compose(
  withNamespaces('translation'),
)(SearchInput);
