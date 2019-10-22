import React, { Component } from 'react';
import get from 'lodash/get';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import Modal from '@/components/modal';
import SubscriptionAvatar from '@/components/subscription-avatar';
import Button from '@/components/button';
import Dropdown from '@/components/dropdown';
import Form from '@/components/form/form';
import Input from '@/components/form/input';
import Textarea from '@/components/form/textarea';
import { api } from '@';
import { getOpponentUser } from '@/helpers';
import { actions as tasksActions } from '@/store/tasks';
import { actions as formActions } from '@/components/form';
import style from './style.css';

class NewTask extends Component {
  attach = async () => {
    if (!this.props.title.value) {
      return;
    }

    let options = {
      group_id: this.props.details.group_id,
    };

    if (this.props.details.group.type !== 'private_chat' && this.props.executor.value) {
      options['executor_id'] = this.props.executor.value;
    }

    if (this.props.description.value) {
      options['description'] = this.props.description.value;
    }

    const { task } = await api.createTask({
      title: this.props.title.value,
      ...options,
    });

    this.props.addTask(task);
    this.props.close();
  };

  getExecutors = () => {
    if (this.props.details.group.type === 'private_chat') {
      return [];
    }

    let items = [];

    this.props.details.group.participants.forEach(item => {
      if (item.user_id !== this.props.currentUserId && item.user.nick) {
        items.push({text: item.user.nick, onClick: () => this.setExecutor(item.user_id)});
      }
    });

    return items;
  };

  setExecutor = id => this.props.formChange('new_task.executor', {
    value: id,
    isTouched: true,
    isBlured: true,
  });

  componentDidMount() {
    if (this.props.details.group.type === 'private_chat') {
      const user = getOpponentUser(this.props.details);

      if (!user) {
        return;
      }

      this.props.formChange('new_task.executor', {
        error: '',
        value: user.id,
        isTouched: true,
        isBlured: true,
        isRequired: true,
      });
    }

    if (this.props.details.group.type !== 'private_chat') {
      this.props.formChange('new_task.executor', {
        error: '',
        value: null,
        isTouched: false,
        isBlured: false,
        isRequired: true,
      });
    }
  }

  render() {
    const actions = [{appearance: '_basic-primary', text: 'Attach', onClick: this.attach}];
    const isPrivate = this.props.details.group.type === 'private_chat';
    const isDropdownShown = !isPrivate && !this.props.executor.value;
    const executorDropdownItems = this.getExecutors();

    return <Modal
      actions={actions}
      close={this.props.close}
      className={style.modal}
      wrapClassName={style.wrapper}
    >
      <Form model="new_task" className={style.form}>
        <div className={style.circle} />

        <Input
          appearance="_none-transparent"
          model="new_task.title"
          placeholder="New To-Do"
          className={style.title}
        />

        <div className={style.actions}>
          {isDropdownShown &&
            <Dropdown
              uniqueId="new-task-executor-dropdown"
              items={executorDropdownItems}
              className={style.dropdown}
            >
              <Button appearance="_icon-divider" icon="person" type="button" className={style.person} />
            </Dropdown>
          }

          {this.props.executor.value &&
            <SubscriptionAvatar className={style.avatar} userId={this.props.executor.value} />
          }

          <Dropdown
            uniqueId="new-task-settings-dropdown"
            items={[]}
            className={style.dropdown}
          >
            <Button appearance="_icon-transparent" icon="dots" type="button" className={style.settings} />
          </Dropdown>
        </div>

        <Textarea
          appearance="_none-transparent"
          model="new_task.description"
          placeholder="Notes"
          className={style.description}
        />

        <div className={style.images}>
          <div className={style.preview} style={{'--image': 'url(/assets/default-image.jpg)'}} />
          <div className={style.preview} style={{'--image': 'url(/assets/default-image.jpg)'}} />
          <div className={style.preview} style={{'--image': 'url(/assets/default-image.jpg)'}} />
        </div>

        <p className={style.updated}>Updated by Mark Trubnikov, 10m ago</p>

        <div className={style.attach_actions}>
          <Button appearance="_icon-transparent" icon="dots-list" type="button" className={style.attach} />
          <Button appearance="_icon-transparent" icon="image" type="button" className={style.attach} />
        </div>


        {/*
          <div className={style.header}>
          <Input
            appearance="_none-transparent"
            model="new_task.title"
            placeholder="New To-Do"
            className={style.title}
          />

          {isDropdownShown &&
            <Dropdown
              uniqueId="new-task-executor-dropdown"
              items={executorDropdownItems}
              className={style.dropdown}
            >
              <Button appearance="_icon-divider" icon="person" type="button" className={style.person} />
            </Dropdown>
          }

          {this.props.executor.value &&
            <SubscriptionAvatar className={style.avatar} userId={this.props.executor.value} />
          }
        </div>
      */}
      </Form>
    </Modal>;
  }
}

export default compose(
  connect(
    (state, props) => ({
      currentUserId: state.currentUser.id,
      title: get(state.forms, 'new_task.title', {}),
      description: get(state.forms, 'new_task.description', {}),
      executor: get(state.forms, 'new_task.executor', {}),
      details: state.subscriptions.list[props.options.subscription_id],
    }),

    {
      addTask: tasksActions.addTask,
      formChange: formActions.formChange,
    },
  ),
)(NewTask);
