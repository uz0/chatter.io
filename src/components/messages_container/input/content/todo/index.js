import React, { Component } from 'react';
import compose from 'recompose/compose';
import classnames from 'classnames/bind';
import { connect } from 'react-redux';
import get from 'lodash/get';
import clone from 'lodash/clone';
import Icon from '@/components/icon';
import inputActions from '@/components/messages_container/input/actions';
import style from './style.css';

const cx = classnames.bind(style);

class Todo extends Component {
  deleteTodo = index => () => {
    let todos = clone(this.props.todos);
    todos.splice(index, 1);
    this.props.setTodo(todos);
  };

  render() {
    if (this.props.todos.length === 0) {
      return null;
    }

    return <div className={cx('todo', this.props.className)}>
      {this.props.todos.map((todo, index) => <button key={todo.title} className={style.item}>
        <div className={style.circle}>
          <Icon name="mark" />
        </div>

        <p className={style.title}>{todo.title}</p>

        <button type="button" className={style.delete} onClick={this.deleteTodo(index)}>
          <Icon name="close" />
        </button>
      </button>)}
    </div>;
  }
}

export default compose(
  connect(
    state => ({
      todos: get(state.input, 'todo', []),
      editMessage: state.messages.list[state.messages.edit_message_id],
    }),

    {
      setTodo: inputActions.setTodo,
    },
  ),
)(Todo);
