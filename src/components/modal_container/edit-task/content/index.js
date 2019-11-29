import React, { Component, Fragment } from 'react';
import get from 'lodash/get';
import map from 'lodash/map';
import find from 'lodash/find';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import classnames from 'classnames/bind';
import moment from 'moment';
import SubscriptionAvatar from '@/components/subscription-avatar';
import Attach from '@/components/attach';
import Button from '@/components/button';
import Dropdown from '@/components/dropdown';
import Loading from '@/components/loading';
import Icon from '@/components/icon';
import Form from '@/components/old-form/form';
import Input from '@/components/old-form/input';
import Textarea from '@/components/old-form/textarea';
import { api } from '@';
import { getOpponentUser, getProgressText } from '@/helpers';
import { actions as galleryActions } from '@/components/gallery_container';
import { actions as formActions } from '@/components/old-form';
import { actions as notificationActions } from '@/components/notification';
import inputActions from '@/components/messages_container/input/actions';
import style from './style.css';

const cx = classnames.bind(style);

class Content extends Component {
  state = {
    organization_users: [],
    isLoading: false,
  };

  create = async () => {
    if (!this.props.title.value) {
      return;
    }

    let options = {
      title: this.props.title.value,
    };

    if (this.props.details) {
      options['group_id'] = this.props.details.group_id;
    }

    if (this.props.details && this.props.details.group.organization_id) {
      options['organization_id'] = this.props.details.group.organization_id;
    }

    if (this.props.organization_id) {
      options['organization_id'] = this.props.organization_id;
    }

    if (this.props.details && this.props.details.group.type !== 'private_chat' && this.props.executor.value) {
      options['executor_id'] = this.props.executor.value;
    }

    if (this.props.details && this.props.description.value) {
      options['description'] = this.props.description.value;
    }

    if (this.props.details && this.props.uploads_id.value) {
      options['uploads_id'] = this.props.uploads_id.value;
    }

    if (this.props.is_input) {
      this.props.setTodo(options);
    } else {
      await api.createTask(options);
    }

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
    if (!this.props.task_id) {
      return;
    }

    if (!this.props.title.value) {
      return;
    }

    if (this.props.title.value === this.props.task_title) {
      return;
    }

    this.setState({ isLoading: true });
    await api.updateTask({ task_id: this.props.task_id, title: this.props.title.value });
    this.setState({ isLoading: false });
  };

  onDescriptionBlur = async () => {
    if (!this.props.task_id) {
      return;
    }

    if (!this.props.description.value) {
      return;
    }

    if (this.props.description.value === this.props.task_description) {
      return;
    }

    this.setState({ isLoading: true });
    await api.updateTask({ task_id: this.props.task_id, description: this.props.description.value });
    this.setState({ isLoading: false });
  };

  getExecutors = () => {
    if (this.props.details && this.props.details.group.type === 'private_chat') {
      return [];
    }

    let participants;

    if (!this.props.details && this.props.organization_id && this.state.organization_users.length > 0) {
      participants = this.state.organization_users;
    }

    if (this.props.details) {
      participants = this.props.details.group.participants;
    }

    if (!participants) {
      return [];
    }

    let items = [];

    participants.forEach(item => {
      if (item.user_id !== this.props.currentUserId && item.user.nick) {
        items.push({
          text: item.user.nick,
          onClick: () => this.setExecutor(item.user_id),
          customIcon: <SubscriptionAvatar className={style.dropdown_avatar} userId={item.user_id} />,
        });
      }
    });

    return items;
  };

  onTitleBlur = async () => {
    if (!this.props.task_id) {
      return;
    }

    if (!this.props.title.value) {
      return;
    }

    if (this.props.title.value === this.props.task_title) {
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

    if (!this.props.task_id) {
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
    try {
      this.setState({ isLoading: true });
      await api.destroyTaskAttachment({task_id: this.props.task_id, signed_id: id});
      this.setState({ isLoading: false });
    } catch (error) {
      console.error(error);
      this.props.showNotification({ text: error.text });
    }
  };

  getLastUpdatedTime = time => {
    const diff = moment().diff(moment(time));
    const diffInMinutes = moment.duration(diff).asMinutes();

    if (diffInMinutes < 30) {
      setTimeout(() => this.forceUpdate(), 60000);
      return `${Math.ceil(diffInMinutes)}m ago`;
    }

    if (moment(time).isSame(moment(), 'day')) {
      return `${moment(time).format('HH:mm')}`;
    }

    return `${moment(time).format('DD MMMM, HH:mm')}`;
  };

  getDefaultAttachments = () => {
    if (!this.props.task_id) {
      return [];
    }

    if (!this.props.task_attachments || this.props.task_attachments.length === 0) {
      return [];
    }

    let attachments = [];

    this.props.task_attachments.forEach(item => {
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

  async componentDidMount() {
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

    if (this.props.details && this.props.details.group.type !== 'private_chat') {
      this.props.formChange('edit_task.executor', {
        error: '',
        value: this.props.task_id ? this.props.task_executor_id : null,
        isTouched: false,
        isBlured: false,
        isRequired: true,
      });
    }

    if (!this.props.details && this.props.organization_id) {
      const { organizations_users } = await api.getOrganizationUsers({organization_id: this.props.organization_id});
      this.setState({ organization_users: organizations_users });
    }

    this.props.formChange('edit_task.done', {
      error: '',
      value: this.props.task_id ? this.props.task_done : false,
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

    if (this.props.task_id && this.props.task_description) {
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
    const lastUpdatedName = this.props.task_last_change_user && this.props.task_last_change_user.nick || 'no nick';
    const lastUpdatedTime = this.getLastUpdatedTime(this.props.task_updated_at);

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
            {...this.props.task_id ? { defaultValue: this.props.task_title } : {}}
          />

          <Textarea
            id="task-modal-textarea"
            appearance="_none-transparent"
            model="edit_task.description"
            placeholder="Notes"
            className={style.description}
            onBlur={this.onDescriptionBlur}
            {...this.props.task_id ? { defaultValue: this.props.task_description } : {}}
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
        {...this.props.task_id ? { defaultValue: defaultAttachments } : {}}
      >
        {({ files, images, removeAttachment }) => {
          const imagesUrls = map(images, image => image.url);
          const isImagesExist = images.length > 0;
          const isFilesExist = files.length > 0;

          return <Fragment>
            {isImagesExist &&
              <div className={style.images}>
                {images.map((image, index) => {
                  if (!image.preview) {
                    return;
                  }

                  let close;

                  if (this.props.task_id) {
                    close = event => {
                      event.stopPropagation();
                      this.destroyAttachment(image.uid);
                    };
                  } else {
                    close = event => {
                      event.stopPropagation();
                      removeAttachment(image.uid)(event);
                    };
                  }

                  const inline = { 'background-image': `url(${image.preview})` };

                  const toggleGallery = () => this.props.openGallery({
                    images: imagesUrls,
                    index,
                  });

                  return <button
                    key={image.uid}
                    style={inline}
                    type="button"
                    onClick={toggleGallery}
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
                  </button>;
                })}
              </div>
            }

            {isFilesExist &&
              <div className={style.files}>
                {files.map(file => {
                  const isLoading = file.currentChunk < file.byte_size;
                  const progress = getProgressText(file);

                  let close;

                  if (this.props.task_id) {
                    close = event => {
                      event.stopPropagation();
                      this.destroyAttachment(file.uid);
                    };
                  } else {
                    close = event => {
                      event.stopPropagation();
                      removeAttachment(file.uid)(event);
                    };
                  }

                  return <div key={file.file_name} className={style.file}>
                    {isLoading &&
                      <Loading className={style.file_loading} isShown />
                    }

                    {!isLoading &&
                      <Icon name="file" />
                    }

                    <p className={style.name}>{file.file_name}</p>
                    <span className={style.size}>{progress}</span>

                    <button type="button" className={style.delete} onClick={close}>
                      <Icon name="close" />
                    </button>
                  </div>;
                })}
              </div>
            }
          </Fragment>;
        }}
      </Attach>

      <div className={style.footer}>
        {lastUpdatedTime &&
          <p className={style.updated}>Updated by {lastUpdatedName}, {lastUpdatedTime}</p>
        }

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
    state => ({
      currentUserId: state.currentUser.id,
      done: get(state.forms, 'edit_task.done', {}),
      title: get(state.forms, 'edit_task.title', {}),
      description: get(state.forms, 'edit_task.description', {}),
      executor: get(state.forms, 'edit_task.executor', {}),
      uploads_id: get(state.forms, 'edit_task.uploads_id', null),
    }),

    {
      formChange: formActions.formChange,
      openGallery: galleryActions.openGallery,
      setTodo: inputActions.setTodo,
      showNotification: notificationActions.showNotification,
    },
  ),

  connect(
    (state, props) => {
      const task = state.tasks && state.tasks.list[props.task_id];

      if (!task) {
        return { task: undefined };
      }

      return {
        task_title: get(task, 'title', ''),
        task_description: get(task, 'description', ''),
        task_executor_id: get(task, 'executor_id'),
        task_done: get(task, 'done', false),
        task_group_id: get(task, 'group_id'),
        task_last_change_user: get(task, 'last_change_user'),
        task_updated_at: get(task, 'updated_at'),
        task_attachments: get(task, 'attachments', []),
      };
    },
  ),

  connect(
    (state, props) => {
      let details;

      if (props.subscription_id) {
        details = state.subscriptions.list[props.subscription_id];
      }

      if (!details && props.task_group_id) {
        details = find(state.subscriptions.list, { group_id: props.task_group_id });
      }

      return { details };
    },
  ),
)(Content);
