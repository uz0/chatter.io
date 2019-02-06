import React, { Component } from 'react';
import classnames from 'classnames/bind';
import Button from '@/components/button';
import style from './style.css';

const cx = classnames.bind(style);

class Modal extends Component {
  render() {
    return <div className={style.wrapper}>
      <div className={cx('modal', this.props.wrapClassName)}>
        <div className={style.header}>
          <p className={style.title}>{this.props.title}</p>

          <Button
            appearance="_icon-transparent"
            icon="close"
            onClick={this.props.close}
            className={style.close}
          />
        </div>

        <div className={cx('content', this.props.className)}>{this.props.children}</div>

        <div className={style.actions}>
          {this.props.actions.map(action => <button
            key={action.text}
            onClick={action.onClick}
          >{action.text}</button>)}
        </div>
      </div>
    </div>;
  }
}

export default Modal;
