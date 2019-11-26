import React, { Component } from 'react';
import { Portal } from 'react-portal';
import classnames from 'classnames/bind';
import get from 'lodash/get';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import Icon from '@/components/icon';
import { uid } from '@/helpers';
import { ClickOutside } from 'reactjs-click-outside';
import actions from './actions';
import style from './style.css';

export { default as actions } from './actions';
export { default as reducers } from './reducers';

const cx = classnames.bind(style);

class Dropdown extends Component {
  toggleDropdown = event => {
    event.persist();
    event.stopPropagation();

    const buttonElement = event.target;

    if (this.props.isShown) {
      this.props.closeDropdown(this.props.uniqueId);
      return;
    }

    let { top, left } = buttonElement.getBoundingClientRect();
    let right = 'auto';
    let bottom = 'auto';

    const offsetHeight = buttonElement.offsetHeight;

    if (top > (window.innerHeight / 2)) {
      bottom = window.innerHeight - top - buttonElement.offsetHeight;
    }

    if (left > (window.innerWidth / 2)) {
      right = window.innerWidth - left - buttonElement.offsetWidth;
    }

    if (top !== 'auto') {
      top = top + offsetHeight;
    }

    if (bottom !== 'auto') {
      bottom = bottom + offsetHeight;
    }

    // 40  - примерно, с запасом
    const listHeight = 40 * this.props.items.length;

    if (listHeight + top > window.innerHeight) {
      top = 'auto';
      bottom = 0;
    }

    this.props.openDropdown({
      uniqueId: this.props.uniqueId,

      options: {
        ...bottom !== 'auto' ? {bottom} : {top},
        ...right !== 'auto' ? {right} : {left},
      },
    });
  };

  closeDropdown = () => {
    // плагин выдает много вызовов outsideCall, ставим проверку
    if (this.props.isShown) {
      this.props.closeDropdown(this.props.uniqueId);
    }
  };

  onItemClick = onClick => event => {
    onClick(event);
    this.props.closeDropdown(this.props.uniqueId);
  };

  render() {
    return <ClickOutside outsideCall={this.closeDropdown}>
      <div className={cx('dropdown', this.props.className)}>
        {React.cloneElement(this.props.children, {
          onClick: this.toggleDropdown,
        })}

        {this.props.isShown &&
          <Portal>
            <div
              className={style.list}

              style={{
                left: this.props.left,
                right: this.props.right,
                top: this.props.top,
                bottom: this.props.bottom,
              }}
            >
              {this.props.items.map(item => <button
                {...item.id ? { id: item.id } : {}}
                key={uid()}
                onClick={this.onItemClick(item.onClick)}
                className={cx({'_is-danger': item.isDanger})}
                type="button"
              >
                {item.icon &&
                  <Icon name={item.icon} />
                }

                <span>{item.text}</span>
              </button>)}
            </div>
          </Portal>
        }
      </div>
    </ClickOutside>;
  }
}

export default compose(
  connect(
    (state, props) => ({
      isShown: get(state, `dropdown.${props.uniqueId}.isShown`, false),
      left: get(state, `dropdown.${props.uniqueId}.left`, 'auto'),
      right: get(state, `dropdown.${props.uniqueId}.right`, 'auto'),
      top: get(state, `dropdown.${props.uniqueId}.top`, 'auto'),
      bottom: get(state, `dropdown.${props.uniqueId}.bottom`, 'auto'),
    }),

    {
      openDropdown: actions.openDropdown,
      closeDropdown: actions.closeDropdown,
    },
  ),
)(Dropdown);
