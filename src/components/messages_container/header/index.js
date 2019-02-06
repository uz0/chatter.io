import React, { Component } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames/bind';
import { actions as modalActions} from '@/components/modal_container';
import style from './style.css';

const cx = classnames.bind(style);

class Header extends Component {
  showPanelContainer = () => this.props.showModal('panel-container');

  render() {
    return <div className={cx('header', this.props.className)}>
      <button onClick={this.showPanelContainer}>{this.props.title}</button>
      <p className={style.count}>{this.props.count} people</p>
    </div>;
  }
}

export default connect(
  null,

  {
    showModal: modalActions.showModal,
  },
)(Header);
