import React, { Component } from 'react';
import compose from 'recompose/compose';
import classnames from 'classnames/bind';
import { withTranslation } from 'react-i18next';
import Icon from '@/components/icon';
import style from './style.css';

const cx = classnames.bind(style);

class SearchInput extends Component {
  render() {
    return <div className={cx('wrapper', this.props.className)}>
      <Icon name="search" />

      <input
        type="text"
        placeholder={this.props.placeholder || this.props.t('search')}
        value={this.props.value}
        onInput={this.props.onInput}
        onChange={() => {}}
      />
    </div>;
  }
}

export default compose(
  withTranslation(),
)(SearchInput);
