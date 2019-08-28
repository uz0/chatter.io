import React, { Component } from 'react';
import classnames from 'classnames/bind';
import Button from '@/components/button';
import style from './style.css';

const cx = classnames.bind(style);

class Modal extends Component {
  render() {
    return <div className={cx('modal', this.props.wrapClassName)}>
      <div className={style.header}>
        <p className={style.title}>{this.props.title}</p>

        <Button
          appearance="_fab-divider"
          icon="close"
          onClick={this.props.close}
          className={style.close}
        />
      </div>

      <div className={cx('content', this.props.className)}>
        {this.props.children}
      </div>
    </div>;
  }
}

export default Modal;
