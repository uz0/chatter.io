import React, { Component } from 'react';
import classnames from 'classnames/bind';
import Icon from '@/components/icon';
import style from './style.css';

const cx = classnames.bind(style);

class Button extends Component {
  render = () => <button
    type={this.props.type}
    ref={this.props.ref}
    className={cx('button', this.props.className)}
    appearance={this.props.appearance}
    onClick={this.props.onClick}
    {...this.props.disabled ? {disabled: true} : {}}
  >
    {this.props.icon && <Icon name={this.props.icon} />}
    {this.props.text && <span>{ this.props.text }</span>}
  </button>;
}

export default Button;
