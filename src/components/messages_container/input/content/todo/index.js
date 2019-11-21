import React, { Component } from 'react';
import compose from 'recompose/compose';
import classnames from 'classnames/bind';
import { connect } from 'react-redux';
import Icon from '@/components/icon';
import inputActions from '@/components/messages_container/input/actions';
import style from './style.css';

const cx = classnames.bind(style);

class Todo extends Component {
  deleteTodo = () => {
    this.props.setTodo(null);
  };

  render() {
    if (!this.props.todo) {
      return null;
    }

    return <div className={cx('todo', this.props.className)}>
      <button className={style.item}>
        <div className={style.circle}>
          <Icon name="mark" />
        </div>

        <p className={style.title}>{this.props.todo.title}</p>

        <button type="button" className={style.delete} onClick={this.deleteTodo}>
          <Icon name="close" />
        </button>
      </button>
    </div>;
  }
}

export default compose(
  connect(
    state => ({
      todo: state.input.todo,
      editMessage: state.messages.list[state.messages.edit_message_id],
    }),

    {
      setTodo: inputActions.setTodo,
    },
  ),
)(Todo);
