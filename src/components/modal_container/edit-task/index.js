import React, { Component, Fragment } from 'react';
import get from 'lodash/get';
import map from 'lodash/map';
import find from 'lodash/find';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import Modal from '@/components/modal';
import SubscriptionAvatar from '@/components/subscription-avatar';
import Attach from '@/components/attach';
import Button from '@/components/button';
import Dropdown from '@/components/dropdown';
import Loading from '@/components/loading';
import Icon from '@/components/icon';
import Form from '@/components/form/form';
import Input from '@/components/form/input';
import Textarea from '@/components/form/textarea';
import { api } from '@';
import { getOpponentUser, uid } from '@/helpers';
import { actions as tasksActions } from '@/store/tasks';
import { actions as formActions } from '@/components/form';
import style from './style.css';

class EditTask extends Component {
  create = async () => {
    if (!this.props.title.value) {
      return;
    }

    let options = {
      title: this.props.title.value,
      group_id: this.props.details.group_id,
    };

    if (this.props.details.group.type !== 'private_chat' && this.props.executor.value) {
      options['executor_id'] = this.props.executor.value;
    }

    if (this.props.description.value) {
      options['description'] = this.props.description.value;
    }

    if (this.props.uploads_id.value) {
      options['uploads_id'] = this.props.uploads_id.value;
    }

    const { task } = await api.createTask({ ...options });
    this.props.addTask(task);
    this.props.close();
  };

  update = async () => {
    if (!this.props.title.value) {
      return;
    }

    let options = {
      task_id: this.props.options.task_id,
    };

    if (this.props.task.title !== this.props.title.value) {
      options['title'] = this.props.title.value;
    }

    if (this.props.task.description !== this.props.description.value) {
      options['description'] = this.props.description.value;
    }

    if (this.props.task.executor_id !== this.props.executor.value) {
      options['executor_id'] = this.props.executor.value;
    }

    // тут должно быть добавление uploads_id

    const { task } = await api.updateTask({ ...options });
    this.props.updateTask(task);
    this.props.close();
  };

  delete = async () => {
    await api.destroyTask({ task_id: this.props.options.task_id });
    this.props.close();
    this.props.deleteTask(this.props.options.task_id);
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

  setExecutor = id => this.props.formChange('edit_task.executor', {
    value: id,
    isTouched: true,
    isBlured: true,
  });

  attachImages = () => {
    const input = document.querySelector('#edit-task-attach');

    if (!input) {
      return;
    }

    input.click();
  };

  onAttachmentsChange = data => {
    const uploads_id = map(data, 'upload_id');

    if (!uploads_id || uploads_id.length === 0) {
      return;
    }

    this.props.formChange('edit_task.uploads_id', {
      value: uploads_id,
      isTouched: true,
      isBlured: true,
    });
  };
    
  getDefaultAttachments = () => {
    if (!this.props.task) {
      return [];
    }

    if (!this.props.task.attachments || this.props.task.attachments.length === 0) {
      return [];
    }

    let attachments = [];

    this.props.task.attachments.forEach(item => {
      attachments.push({
        uid: uid(),
        byte_size: item.byte_size,
        content_type: item.content_type,
        file_name: item.filename,
        preview: item.url,
        url: item.url,
        upload_id: null,
        isLoading: false,
      });
    });

    return attachments;
  };

  componentDidMount() {
    if (this.props.details.group.type === 'private_chat') {
      const user = getOpponentUser(this.props.details);

      if (!user) {
        return;
      }

      this.props.formChange('edit_task.executor', {
        error: '',
        value: user.id,
        isTouched: true,
        isBlured: true,
        isRequired: true,
      });
    }

    if (this.props.details.group.type !== 'private_chat') {
      this.props.formChange('edit_task.executor', {
        error: '',
        value: this.props.task ? this.props.task.executor_id : null,
        isTouched: false,
        isBlured: false,
        isRequired: true,
      });
    }

    this.props.formChange('edit_task.uploads_id', {
      error: '',
      value: null,
      isTouched: false,
      isBlured: false,
      isRequired: false,
    });
  }

  render() {
    let actions = [];
    let taskDropdownItems = [];

    if (this.props.options.task_id) {
      actions.push({appearance: '_basic-primary', text: 'Update', onClick: this.update});
      taskDropdownItems.push({text: 'Delete', onClick: this.delete});
    } else {
      actions.push({appearance: '_basic-primary', text: 'Attach', onClick: this.create});
    }

    const isPrivate = this.props.details.group.type === 'private_chat';
    const isDropdownShown = !isPrivate && !this.props.executor.value;
    const executorDropdownItems = this.getExecutors();
    const defaultAttachments = this.getDefaultAttachments();

    return <Modal
      actions={actions}
      close={this.props.close}
      className={style.modal}
      wrapClassName={style.wrapper}
    >
      <Form model="edit_task" className={style.form}>
        <div className={style.circle} />

        <Input
          appearance="_none-transparent"
          model="edit_task.title"
          placeholder="New To-Do"
          className={style.title}
          {...this.props.task ? { defaultValue: this.props.task.title } : {}}
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
            items={taskDropdownItems}
            className={style.dropdown}
          >
            <Button appearance="_icon-transparent" icon="dots" type="button" className={style.settings} />
          </Dropdown>
        </div>

        <Textarea
          appearance="_none-transparent"
          model="edit_task.description"
          placeholder="Notes"
          className={style.description}
          {...this.props.task ? { defaultValue: this.props.task.description } : {}}
        />

        <Attach
          uniqueId="edit-task-attach"
          onChange={this.onAttachmentsChange}
          {...this.props.task ? { defaultValue: defaultAttachments } : {}}
        >
          {({ images, removeAttachment }) => {
            const isImagesExist = images.length > 0;

            return <Fragment>
              {isImagesExist &&
                <div className={style.images}>
                  {images.map(image => {
                    if (!image.preview) {
                      return;
                    }

                    const inline = { '--image': `url(${image.preview})` };

                    return <div
                      key={image.uid}
                      style={inline}
                      className={style.preview}
                    >
                      <button className={style.close} onClick={removeAttachment(image.uid)}>
                        <Icon name="close" />
                      </button>

                      {image.isLoading &&
                        <Fragment>
                          <Loading className={style.file_loading} isShown />
                        </Fragment>
                      }
                    </div>;
                  })}
                </div>
              }
            </Fragment>;
          }}
        </Attach>

        <p className={style.updated}>Updated by Mark Trubnikov, 10m ago</p>

        <div className={style.attach_actions}>
          <Button appearance="_icon-transparent" icon="dots-list" type="button" className={style.attach} />
          <Button appearance="_icon-transparent" icon="image" type="button" className={style.attach} onClick={this.attachImages} />
        </div>
      </Form>
    </Modal>;
  }
}

export default compose(
  connect(
    (state, props) => ({
      currentUserId: state.currentUser.id,
      title: get(state.forms, 'edit_task.title', {}),
      description: get(state.forms, 'edit_task.description', {}),
      executor: get(state.forms, 'edit_task.executor', {}),
      uploads_id: get(state.forms, 'edit_task.uploads_id', null),
      details: state.subscriptions.list[props.options.subscription_id],
    }),

    {
      addTask: tasksActions.addTask,
      updateTask: tasksActions.updateTask,
      deleteTask: tasksActions.deleteTask,
      formChange: formActions.formChange,
    },
  ),

  connect(
    (state, props) => ({
      task: props.options.task_id ? state.tasks.list[props.options.task_id] : undefined,
    }),
  ),

  connect(
    (state, props) => {
      let details;

      if (props.options.subscription_id) {
        details = state.subscriptions.list[props.options.subscription_id];
      }

      if (!details && props.task) {
        details = find(state.subscriptions.list, { group_id: props.task.group_id });
      }

      return { details };
    },
  ),
)(EditTask);
