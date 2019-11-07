import React, { Component, Fragment } from 'react';
import get from 'lodash/get';
import map from 'lodash/map';
import find from 'lodash/find';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
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
import { getOpponentUser } from '@/helpers';
import { actions as formActions } from '@/components/form';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

class Content extends Component {
  state = {
    isLoading: false,
  };

  create = async () => {
    if (!this.props.title.value) {
      return;
    }

    let options = {
      title: this.props.title.value,
      group_id: this.props.details.group_id,
    };

    if (this.props.details.group.organization_id) {
      options['organization_id'] = this.props.details.group.organization_id;
    }

    if (this.props.details.group.type !== 'private_chat' && this.props.executor.value) {
      options['executor_id'] = this.props.executor.value;
    }

    if (this.props.description.value) {
      options['description'] = this.props.description.value;
    }

    if (this.props.uploads_id.value) {
      options['uploads_id'] = this.props.uploads_id.value;
    }

    await api.createTask({ ...options });
    this.props.close();
  };

  delete = async () => {
    await api.destroyTask({ task_id: this.props.task_id });
    this.props.close();
  };

  calcTextareaHeight = () => {
    const textarea = document.querySelector('#task-modal-textarea');

    if (!textarea) {
      return;
    }

    textarea.style.height = '20px';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  onTitleBlur = async () => {
    if (!this.props.task) {
      return;
    }

    if (!this.props.title.value) {
      return;
    }

    if (this.props.title.value === this.props.task.title) {
      return;
    }

    this.setState({ isLoading: true });
    await api.updateTask({ task_id: this.props.task_id, title: this.props.title.value });
    this.setState({ isLoading: false });
  };

  onDescriptionBlur = async () => {
    if (!this.props.task) {
      return;
    }

    if (!this.props.description.value) {
      return;
    }

    if (this.props.description.value === this.props.task.description) {
      return;
    }

    this.setState({ isLoading: true });
    await api.updateTask({ task_id: this.props.task_id, description: this.props.description.value });
    this.setState({ isLoading: false });
  };

  getExecutors = () => {
    if (!this.props.details || this.props.details.group.type === 'private_chat') {
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




  onTitleBlur = async () => {
    if (!this.props.task) {
      return;
    }

    if (!this.props.title.value) {
      return;
    }

    if (this.props.title.value === this.props.task.title) {
      return;
    }

    this.setState({ isLoading: true });
    await api.updateTask({ task_id: this.props.task_id, title: this.props.title.value });
    this.setState({ isLoading: false });
  };

  toggleDone = async () => {
    const done = !this.props.done.value;

    this.props.formChange('edit_task.done', {
      value: done,
      isTouched: true,
      isBlured: true,
    });

    if (!this.props.task) {
      return;
    }

    this.setState({ isLoading: true });
    await api.updateTask({ task_id: this.props.task_id, done });
    this.setState({ isLoading: false });
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

  onAttachmentsChange = async data => {
    const uploads_id = map(data, 'upload_id');

    if (!uploads_id || uploads_id.length === 0) {
      return;
    }

    if (!this.props.task_id) {
      this.props.formChange('edit_task.uploads_id', {
        value: uploads_id,
        isTouched: true,
        isBlured: true,
      });

      return;
    }

    this.setState({ isLoading: true });
    await api.updateTask({ task_id: this.props.task_id, uploads_id });
    this.setState({ isLoading: false });
  };

  destroyAttachment = async id => {
    await api.destroyTaskAttachment({task_id: this.props.task_id, signed_id: id});
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
        uid: item.signed_id,
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
    if (this.props.details && this.props.details.group.type === 'private_chat') {
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

    this.props.formChange('edit_task.done', {
      error: '',
      value: this.props.task ? this.props.task.done : false,
      isTouched: false,
      isBlured: false,
      isRequired: false,
    });

    this.props.formChange('edit_task.uploads_id', {
      error: '',
      value: null,
      isTouched: false,
      isBlured: false,
      isRequired: false,
    });

    if (this.props.task && this.props.task.description) {
      setTimeout(() => this.calcTextareaHeight());
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.description.value !== nextProps.description.value) {
      this.calcTextareaHeight();
    }
  }

  render() {
    let taskDropdownItems = [];

    if (this.props.task_id) {
      taskDropdownItems.push({text: 'Delete', onClick: this.delete});
    }

    const isPrivate = this.props.details && this.props.details.group.type === 'private_chat';
    const isDropdownShown = !isPrivate && !this.props.executor.value;
    const executorDropdownItems = this.getExecutors();
    const defaultAttachments = this.getDefaultAttachments();

    return <Form model="edit_task" className={style.content}>
      {this.state.isLoading &&
        <Loading type="line" isShown className={style.modal_loading} />
      }

      <div className={style.header}>
        <button type="button" className={cx('circle', {'_is-checked': this.props.done.value})} onClick={this.toggleDone}>
          <Icon name="mark" />
        </button>

        <div className={style.section}>
          <Input
            appearance="_none-transparent"
            model="edit_task.title"
            placeholder="New To-Do"
            className={style.title}
            onBlur={this.onTitleBlur}
            {...this.props.task ? { defaultValue: this.props.task.title } : {}}
          />

          <Textarea
            id="task-modal-textarea"
            appearance="_none-transparent"
            model="edit_task.description"
            placeholder="Notes"
            className={style.description}
            onBlur={this.onDescriptionBlur}
            {...this.props.task ? { defaultValue: this.props.task.description } : {}}
          />
        </div>

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

                  let close;

                  if (this.props.task_id) {
                    close = () => {
                      this.destroyAttachment(image.uid);
                    };
                  } else {
                    close = event => removeAttachment(image.uid)(event);
                  }

                  const inline = { 'background-image': `url(${image.preview})` };

                  return <div
                    key={image.uid}
                    style={inline}
                    className={style.preview}
                  >
                    <button type="button" className={style.close} onClick={close}>
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

      <div className={style.footer}>
        <p className={style.updated}>Updated by Mark Trubnikov, 10m ago</p>
        <Button appearance="_icon-transparent" icon="dots-list" type="button" className={style.attach} />
        <Button appearance="_icon-transparent" icon="image" type="button" className={style.attach} onClick={this.attachImages} />
      </div>

      {!this.props.task_id &&
        <div className={style.actions}>
          <Button type="button" appearance="_basic-primary" text="Attach" className={style.submit} onClick={this.create} />
        </div>
      }
    </Form>;
  }
}

export default compose(
  connect(
    (state, props) => ({
      currentUserId: state.currentUser.id,
      done: get(state.forms, 'edit_task.done', {}),
      title: get(state.forms, 'edit_task.title', {}),
      description: get(state.forms, 'edit_task.description', {}),
      executor: get(state.forms, 'edit_task.executor', {}),
      uploads_id: get(state.forms, 'edit_task.uploads_id', null),
      details: state.subscriptions.list[props.subscription_id],
    }),

    {
      formChange: formActions.formChange,
    },
  ),

  connect(
    (state, props) => ({
      task: props.task_id ? state.tasks.list[props.task_id] : undefined,
    }),
  ),

  connect(
    (state, props) => {
      let details;

      if (props.subscription_id) {
        details = state.subscriptions.list[props.subscription_id];
      }

      if (!details && props.task) {
        details = find(state.subscriptions.list, { group_id: props.task.group_id });
      }

      return { details };
    },
  ),
)(Content);
