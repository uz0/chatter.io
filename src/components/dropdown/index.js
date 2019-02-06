import React, { Component } from 'react';
import { Portal } from 'react-portal';
import ReactDOM from 'react-dom';
import classnames from 'classnames/bind';
import get from 'lodash/get';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import Icon from '@/components/icon';
import { uid } from '@/helpers';
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

    if (top > (window.innerHeight / 2)) {
      bottom = window.innerHeight - top - buttonElement.offsetWidth;
    }

    if (left > (window.innerWidth / 2)) {
      right = window.innerWidth - left - buttonElement.offsetWidth;
    }

    this.props.openDropdown({
      uniqueId: this.props.uniqueId,

      options: {
        ...bottom !== 'auto' ? {bottom} : {top},
        ...right !== 'auto' ? {right} : {left},
      },
    });
  };

  componentDidMount() {
    // eslint-disable-next-line react/no-find-dom-node
    const buttonElement = ReactDOM.findDOMNode(this.buttonRef);

    window.addEventListener('click', event => {
      if (this.props.isShown && this.listRef && !buttonElement.contains(event.target) && !this.listRef.contains(event.target)) {
        this.props.closeDropdown(this.props.uniqueId);
      }
    });

    window.addEventListener('scroll', () => {
      // в будущем проверять находится ли дропдаун внутри скролящегося элемента
      if (this.props.isShown && this.listRef) {
        this.props.closeDropdown(this.props.uniqueId);
      }
    }, true);
  }

  render() {
    return <div className={cx('dropdown', this.props.className)}>
      {React.cloneElement(this.props.children, {
        onClick: this.toggleDropdown,
        ref: node => this.buttonRef = node,
      })}

      {this.props.isShown &&
        <Portal>
          <div
            className={style.list}
            ref={node => this.listRef = node}

            style={{
              left: this.props.left,
              right: this.props.right,
              top: this.props.top,
              bottom: this.props.bottom,
            }}
          >
            {this.props.items.map(item => <button
              key={uid()}
              onClick={item.onClick}
              className={cx({'_is-danger': item.isDanger})}
            >
              {item.icon &&
                <Icon name={item.icon} />
              }

              <span>{item.text}</span>
            </button>)}
          </div>;
        </Portal>
      }
    </div>;
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
