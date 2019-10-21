import React, { Component } from 'react';
import get from 'lodash/get';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import Modal from '@/components/modal';
import Form from '@/components/form/form';
import Input from '@/components/form/input';
import { api } from '@';
import { actions as tasksActions } from '@/store/tasks';
import style from './style.css';

class NewTask extends Component {
  attach = async () => {
    if (!this.props.title.value) {
      return;
    }

    const { task } = await api.createTask({title: this.props.title.value, ...this.props.options});
    this.props.addTask(task);
    this.props.close();
  };

  render() {
    const actions = [{appearance: '_basic-primary', text: 'Attach', onClick: this.attach}];

    return <Modal
      actions={actions}
      close={this.props.close}
      className={style.modal}
    >
      <div className={style.circle} />

      <Form model="new_task" className={style.section}>
        <div className={style.header}>
          <Input
            appearance="_none-transparent"
            model="new_task.title"
            placeholder="New To-Do"
            className={style.title}
          />

          <div className={style.person} />
          <div className={style.person} />
        </div>
      </Form>
    </Modal>;
  }
}

export default compose(
  connect(
    state => ({
      title: get(state.forms, 'new_task.title', {}),
    }),

    {
      addTask: tasksActions.addTask,
    },
  ),
)(NewTask);
