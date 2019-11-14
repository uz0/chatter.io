import React, { Component, Fragment } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import find from 'lodash/find';
import { withTranslation } from 'react-i18next';
import classnames from 'classnames/bind';
import SubscriptionAvatar from '@/components/subscription-avatar';
import Validators from '@/components/form/validators';
import FakeCheckbox from '@/components/fake-checkbox';
import FakeSelect from '@/components/fake-select';
import Button from '@/components/button';
import Dropdown from '@/components/dropdown';
import Icon from '@/components/icon';
import PhotosList from './photos-list';
import Tasks from './tasks';
import { api } from '@';
import { withRouter, withDetails } from '@/hoc';
import { getChatName, copy, getOpponentUser, getLastActive } from '@/helpers';
import { actions as modalActions } from '@/components/modal_container';
import { actions as subscriptionsActions } from '@/store/subscriptions';
import { actions as notificationActions } from '@/components/notification';
import style from './style.css';

const cx = classnames.bind(style);

class Panel extends Component {
  state = {
    collapseActive: 'tasks',
    chatNamePopupShown: false,
  };

  closePanel = () => this.props.closeModal('panel-container');
  toggleCollapse = name => () => this.setState({ collapseActive: this.state.collapseActive === name ? '' : name });
  browseEditPhoto = () => this.chatAvatarInputRef.click();
  openChangeChatNamePopup = () => this.setState({ chatNamePopupShown: true });
  closeChangeChatNamePopup = () => this.setState({ chatNamePopupShown: false });

  getFilteredChatName = () => {
    const chatNameInput = document.querySelector('#change-chat-name-input');

    if (!chatNameInput.value) {
      return '';
    }

    let text = chatNameInput.value.replace(/\s{2,}/g, ' ');

    if (text[0] === ' ') {
      text = text.substring(1);
    }

    if (text[text.length - 1] === ' ') {
      text = text.substring(0, text.length - 1);
    }

    return text;
  };

  copyInviteLink = () => copy(`${location.origin}/invite/${this.props.details.invite_code}`, () => {
    this.props.showNotification({
      type: 'success',
      text: this.props.t('invite_code_copied'),
    });
  });

  changeChatName = () => {
    const name = this.getFilteredChatName();

    if (!name) {
      this.setState({ chatName: this.props.details.group.name });
      return;
    }

    api.updateGroup({ subscription_id: this.props.details.id, name }).then(() => {
      this.props.updateSubscription({
        id: this.props.details.id,

        group: {
          ...this.props.details.group,
          name,
        },
      });

      this.closeChangeChatNamePopup();
    }).catch(error => {
      console.log(error);

      this.props.showNotification({
        type: 'error',
        text: this.props.t(error.code),
      });
    });
  };

  leaveChat = () => this.props.toggleModal({
    id: 'leave-chat-modal',

    options: {
      subscription_id: this.props.details.id,
    },
  });

  removeUser = id => {
    if (id === this.props.currentUser.id) {
      this.leaveChat();
      return;
    }

    api.kick({ subscription_id: this.props.details.id, user_id: id });
  };

  goToChatByUserId = user_id => {
    if (this.props.currentUser.id === user_id) {
      return;
    }

    api.addContact({ user_id }).then(addContactData => api.getPrivateSubscription({ user_id: addContactData.contact.user.id }).then(data => {
      this.props.addSubscription(data.subscription);
      this.props.pushUrl(`/chat/user/${addContactData.contact.user.id}`);

      if (this.props.isMobile) {
        this.props.closeModal('panel-container');
      }
    })).catch(error => this.props.showNotification({
      type: 'error',
      text: this.props.t(error.code),
    }));
  };

  addPeople = event => {
    event.stopPropagation();

    this.props.toggleModal({
      id: 'invite-modal',
      options: { subscription_id: this.props.details.id },
    });
  };

  setTag = tag => {
    const tags = tag === 'all' ? [null] : [tag];

    api.updateSubscription({ subscription_id: this.props.details.id, tags });
  };

  setAccess = (user_id, role) => api.setAccess({ subscription_id: this.props.details.id, user_id, role }).then(() => {
    let participants = this.props.details.group.participants;
    const index = participants.findIndex(participant => participant.user.id === user_id);

    participants[index] = {
      ...participants[index],
      role,
    };

    this.props.updateSubscription({
      id: this.props.details.id,

      group: {
        ...this.props.details.group,
        participants,
      },
    });
  }).catch(error => this.props.showNotification({
    type: 'error',
    text: this.props.t(error.code),
  }));

  toggleMute = () => {
    let date;

    if (this.props.details.mute_until) {
      date = new Date(2011, 0, 1, 0, 0, 0, 0).toISOString();
    } else {
      date = new Date(new Date().getTime() + 5000).toISOString();
    }

    api.updateSubscription({ subscription_id: this.props.details.id, mute_until: date })
      .then(() => this.props.updateSubscription({ id: this.props.details.id, mute_until: this.props.details.mute_until ? null : date }))

      .catch(error => error.text && this.props.showNotification({
        type: 'error',
        text: this.props.t(error.code),
      }));
  };

  onAvatarInputChange = event => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    if (Validators.fileMaxSize(200000)(file)) {
      this.props.showNotification({
        type: 'info',
        text: this.props.t('file_max_size', { type: this.props.t('image'), count: 200, unit: this.props.t('kb') }),
      });

      this.chatAvatarInputRef.value = '';
      return;
    }

    if (Validators.fileType('image')(file)) {
      this.props.showNotification({
        type: 'info',
        text: this.props.t('file_type', { type: this.props.t('image') }),
      });

      this.chatAvatarInputRef.value = '';
      return;
    }

    if (Validators.fileExtensions(['jpeg', 'png'])(file)) {
      this.props.showNotification({
        type: 'info',
        text: this.props.t('file_extensions', { extensions: '"jpeg", "png"' }),
      });

      this.chatAvatarInputRef.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      api.updateGroup({ subscription_id: this.props.details.id, icon: reader.result }).then(data => {
        this.props.updateSubscription({
          id: this.props.details.id,

          group: {
            ...this.props.details.group,
            icon: data.group.icon,
          },
        });

        this.chatAvatarInputRef.value = '';
      }).catch(error => this.props.showNotification({
        type: 'error',
        text: this.props.t(error.code),
      }));
    };

    reader.readAsDataURL(file);
  };

  resetChatAvatar = () => {
    // сделать репорт - иконка не сбрасывается
    api.updateGroup({ subscription_id: this.props.details.id, icon: null }).then(data => {
      this.props.updateSubscription({
        id: this.props.details.id,

        group: {
          ...this.props.details.group,
          icon: data.group.icon,
        },
      });

      this.chatAvatarInputRef.value = '';
    }).catch(error => this.props.showNotification({
      type: 'error',
      text: this.props.t(error.code),
    }));
  };

  getLastActive = chat => {
    if (chat.group.type !== 'private_chat') {
      return null;
    }

    const opponent = getOpponentUser(chat);

    if (!opponent) {
      return null;
    }

    const user = this.props.users_list[opponent.id];
    return getLastActive(user, () => this.forceUpdate());
  };

  renderPanel = () => {
    const lastActive = this.props.details.group.type === 'private_chat' && this.getLastActive(this.props.details);
    const chatName = getChatName(this.props.details);
    const countParticipants = this.props.details.group.participants.length;
    const currentUserParticipant = this.props.currentUser && find(this.props.details.group.participants, { user_id: this.props.currentUser.id });
    const isCurrentUserAdmin = currentUserParticipant && currentUserParticipant.role === 'admin';
    const isChatRoom = this.props.details.group.type === 'room' || this.props.details.group.type === 'organization_public_room';
    const isRoomWithIcon = isChatRoom && !!this.props.details.group.icon;
    const isInviteCodeBlockShown = isChatRoom && isCurrentUserAdmin && this.props.details.invite_code;
    const isEditNameShown = isChatRoom && isCurrentUserAdmin;

    const notificationsCheckBoxStatus = this.props.details.mute_until ? 'On' : 'Off';
    const invitationLink = `${location.origin}/invite/${this.props.details.invite_code}`;
    const membersLength = this.props.details.group.participants.length;
    const peopleCollapseText = this.props.details.group.is_space ? `${membersLength} members` : this.props.t('people');

    const dropdownMock = [{ text: 'Mock', onClick: () => {} }];

    return <Fragment>
      <div className={style.actions}>
        <Dropdown
          uniqueId="panel-dropdown"
          className={style.dropdown}
          items={dropdownMock}
        >
          <Button appearance="_icon-transparent" icon="dots" />
        </Dropdown>

        <Button
          icon="arrow-left"
          appearance="_fab-divider"
          className={style.close}
          onClick={this.closePanel}
        />

        {this.state.chatNamePopupShown &&
          <div className={style.group_name}>
            <input className={style.input} type="text" defaultValue={chatName} id="change-chat-name-input" />

            <Button
              appearance="_basic-primary"
              text="Ok"
              onClick={this.changeChatName}
              className={style.action}
            />
          </div>
        }
      </div>

      <div className={style.scroll}>
        <div className={style.header}>
          {!this.props.details.group.is_space &&
            <Fragment>
              <input type="file" className={style.change_photo_input} ref={node => this.chatAvatarInputRef = node} onChange={this.onAvatarInputChange} />

              <div className={style.avatar_container}>
                <SubscriptionAvatar subscription={this.props.details} className={style.avatar} />

                {isChatRoom && isCurrentUserAdmin &&
                  <button onClick={this.browseEditPhoto} className={style.edit}>Edit</button>
                }

                {isRoomWithIcon && isCurrentUserAdmin &&
                  <button className={style.close} onClick={this.resetChatAvatar}>
                    <Icon name="close" />
                  </button>
                }
              </div>
            </Fragment>
          }

          <p
            className={
              cx('name', {
                '_is-space': this.props.details.group.is_space,
                '_is_editable': isEditNameShown,
              })
            }

            {...isEditNameShown ? {onClick: this.openChangeChatNamePopup} : {}}
          >{chatName}</p>

          <p className={style.subcaption}>
            {isChatRoom && !this.props.details.group.is_space &&
              `${countParticipants} ${this.props.t('people')}`
            }

            {!isChatRoom && !this.props.details.group.is_space &&
              lastActive
            }

            {this.props.details.group.is_space &&
              <Fragment>Public board</Fragment>
            }
          </p>
        </div>

        <div className={style.section}>
          <p className={style.label}>Notifications</p>

          <FakeCheckbox
            value={this.props.details.mute_until}
            label={notificationsCheckBoxStatus}
            onChange={this.toggleMute}
            className={style.checkbox}
          />
        </div>

        {!this.props.details.group.is_space && <div className={style.section}>
          <p className={style.label}>Chat category</p>

          <FakeSelect
            placeholder="Choose"
            action={this.setTag}
            className={style.select}
            values={[
              { name: 'all', value: 'all' },
              { name: 'work', value: 'work' },
              { name: 'personal', value: 'personal' },
            ]}
          />
        </div>
        }

        {this.props.details.group.is_space && <div className={style.section}>
          <p className={style.label}>Thread category</p>

          <FakeSelect
            placeholder="Choose"
            action={() => {}}
            className={style.select}
            values={[
              { name: 'Mock value 1', value: 'Mock value 1' },
              { name: 'Mock value 2', value: 'Mock value 2' },
              { name: 'Mock value 3', value: 'Mock value 3' },
            ]}
          />
        </div>
        }

        {isInviteCodeBlockShown && <div className={style.section}>
          <p className={style.label}>Invitation link</p>

          <div className={style.invite}>
            <input
              disabled
              value={invitationLink}
              className={style.link}
            />

            <button className={style.button} onClick={this.copyInviteLink}>
              Copy
            </button>
          </div>
        </div>
        }

        {isChatRoom &&
          <button className={cx('setting_button', 'leave')} onClick={this.leaveChat}>
            <Icon name="close" />
            <p className={style.text}>{this.props.t('leave_chat')}</p>
          </button>
        }

        {!isChatRoom &&
          <button className={cx('setting_button', 'leave')} onClick={this.leaveChat}>
            <Icon name="close" />
            <p className={style.text}>{this.props.t('delete_contact')}</p>
          </button>
        }

        {isChatRoom &&
          <div className={cx('collapse', { '_is-open': this.state.collapseActive === 'people' })}>
            <button className={style.collapse_button} onClick={this.toggleCollapse('people')}>
              <span className={style.title}>{peopleCollapseText}</span>

              {isCurrentUserAdmin &&
                <span className={style.button} onClick={this.addPeople}>{this.props.t('add_people')}</span>
              }

              <Icon name="arrow-down" />
            </button>

            <div className={style.collapse_list}>
              {this.props.details.group.participants.map(participant => {
                const user = this.props.users_list[participant.user_id];

                if (!user) {
                  return;
                }

                let peopleDropdownItems = [];

                if (participant.user_id !== this.props.currentUser.id) {
                  peopleDropdownItems.push({
                    text: this.props.t('message'),
                    onClick: () => this.goToChatByUserId(user.id),
                  });
                }

                if (isCurrentUserAdmin) {
                  if (participant.role !== 'admin') {
                    peopleDropdownItems.push({
                      text: this.props.t('set_admin'),
                      onClick: () => this.setAccess(user.id, 'admin'),
                    });
                  }

                  if (participant.role !== 'rw') {
                    peopleDropdownItems.push({
                      text: this.props.t('set_read_write'),
                      onClick: () => this.setAccess(user.id, 'rw'),
                    });
                  }

                  if (participant.role !== 'ro') {
                    peopleDropdownItems.push({
                      text: this.props.t('set_read_only'),
                      onClick: () => this.setAccess(user.id, 'ro'),
                    });
                  }

                  if (participant.user_id !== this.props.currentUser.id) {
                    peopleDropdownItems.push({
                      text: this.props.t('remove'),
                      onClick: () => this.removeUser(user.id),
                      isDanger: true,
                    });
                  }
                }

                return <div key={user.id} className={style.person}>
                  <SubscriptionAvatar subscription={this.props.details} userId={user.id} className={style.avatar} />
                  <p>{user.nick || 'no nick'}</p>
                  {participant.role === 'admin' && <span>{this.props.t('admin')}</span>}

                  <Dropdown
                    uniqueId={`panel-user-dropdown-${user.id}`}
                    className={style.dropdown}
                    items={peopleDropdownItems}
                  >
                    <Button appearance="_icon-transparent" icon="dots" />
                  </Dropdown>
                </div>;
              })}
            </div>
          </div>
        }

        <div className={cx('collapse', { '_is-open': this.state.collapseActive === 'photos' })}>
          <button className={style.collapse_button} onClick={this.toggleCollapse('photos')}>
            <span className={style.title}>{this.props.t('image_plural')}</span>
            <Icon name="arrow-down" />
          </button>

          <div className={style.collapse_list}>
            {this.props.details &&
              <PhotosList details={this.props.details} className={style.photos_list} />
            }
          </div>
        </div>

        <div className={cx('collapse', { '_is-open': this.state.collapseActive === 'tasks' })}>
          <button className={style.collapse_button} onClick={this.toggleCollapse('tasks')}>
            <span className={style.title}>{this.props.t('task_plural')}</span>
            <Icon name="arrow-down" />
          </button>

          <div className={style.collapse_list}>
            <Tasks details_id={this.props.details.id} />
          </div>
        </div>
      </div>
    </Fragment>;
  };

  render() {
    return <div className={cx('panel', this.props.className, { '_is-shown': this.props.isShown })}>
      {this.props.details && this.renderPanel()}
    </div>;
  }
}

export default compose(
  withRouter,
  withDetails,
  withTranslation(),

  connect(
    state => ({
      currentUser: state.currentUser,
      isShown: state.modal.ids.indexOf('panel-container') !== -1,
      isMobile: state.device === 'touch',
      users_list: state.users.list,
    }),

    {
      toggleModal: modalActions.toggleModal,
      closeModal: modalActions.closeModal,
      filterSubscription: subscriptionsActions.filterSubscription,
      addSubscription: subscriptionsActions.addSubscription,
      updateSubscription: subscriptionsActions.updateSubscription,
      showNotification: notificationActions.showNotification,
    },
  ),
)(Panel);
