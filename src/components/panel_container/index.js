import React, { Component, Fragment } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import find from 'lodash/find';
import { withNamespaces } from 'react-i18next';
import classnames from 'classnames/bind';
import SubscriptionAvatar from '@/components/subscription-avatar';
import Validators from '@/components/form/validators';
import Button from '@/components/button';
import Dropdown from '@/components/dropdown';
import Icon from '@/components/icon';
import Loading from '@/components/loading';
import PhotosList from './photos-list';
import { api } from '@';
import { withDetails } from '@/hoc';
import { getChatName } from '@/helpers';
import { actions as modalActions } from '@/components/modal_container';
import { actions as subscriptionsActions } from '@/store/subscriptions';
import { actions as notificationActions } from '@/components/notification';
import style from './style.css';

const cx = classnames.bind(style);

class Panel extends Component {
  state = {
    collapseActive: 'people',
    chatName: '',
    isChatNameInputShown: false,
  };

  closePanel = () => this.props.closeModal('panel-container');
  toggleCollapse = name => () => this.setState({ collapseActive: this.state.collapseActive === name ? '' : name });
  browseEditPhoto = () => this.chatAvatarInputRef.click();
  onChatNameInput = event => this.setState({ chatName: event.target.value });

  getFilteredChatName = () => {
    if (!this.state.chatName) {
      return '';
    }

    let text = this.state.chatName.replace(/\s{2,}/g, ' ');

    if (text[0] === ' ') {
      text = text.substring(1);
    }

    if (text[text.length - 1] === ' ') {
      text = text.substring(0, text.length - 1);
    }

    return text;
  };

  copyInviteLink = () => {
    this.inviteCodeInputRef.select();
    document.execCommand('copy');
    this.props.showNotification(this.props.t('invite_code_copied'));
  };

  onChatNameBlur = () => {
    const name = this.getFilteredChatName();

    if (!name) {
      this.setState({ chatName: this.props.details.group.name });
      return;
    }

    api.updateGroup({ subscription_id: this.props.details.id, name }).then(() => {
      this.props.updateSubscription({
        ...this.props.details,

        group: {
          ...this.props.details.group,
          name,
        },
      });
    }).catch(error => {
      console.log(error);
      this.props.showNotification(this.props.t(error.code));
    });
  };

  leaveChat = () => this.props.toggleModal({
    id: 'leave-chat',

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
      this.props.router.push(`/chat/user/${addContactData.contact.user.id}`);

      if (this.props.isMobile) {
        this.props.closeModal('panel-container');
      }
    })).catch(error => this.props.showNotification(this.props.t(error.code)));
  };

  addPeople = event => {
    event.stopPropagation();

    this.props.toggleModal({
      id: 'invite-modal',
      options: {subscription_id: this.props.details.id},
    });
  };

  setTag = tags => {
    api.updateSubscription({ subscription_id: this.props.details.id, tags });
  }

  setAccess = (user_id, role) => api.setAccess({ subscription_id: this.props.details.id, user_id, role }).then(() => {
    let participants = this.props.details.group.participants;
    const index = participants.findIndex(participant => participant.user.id === user_id);

    participants[index] = {
      ...participants[index],
      role,
    };

    this.props.updateSubscription({
      ...this.props.details,

      group: {
        ...this.props.details.group,
        participants,
      },
    });
  }).catch(error => this.props.showNotification(this.props.t(error.code)));

  toggleMute = () => {
    let date;

    if (this.props.details.mute_until) {
      date = new Date(2011, 0, 1, 0, 0, 0, 0).toISOString();
    } else {
      date = new Date(new Date().getTime() + 5000).toISOString();
    }

    api.updateSubscription({ subscription_id: this.props.details.id, mute_until: date })
      .then(() => this.props.updateSubscription({ id: this.props.details.id, mute_until: this.props.details.mute_until ? null : date }))
      .catch(error => error.text && this.props.showNotification(this.props.t(error.code)));
  };

  onAvatarInputChange = event => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    if (Validators.fileMaxSize(200000)(file)) {
      this.props.showNotification(this.props.t('file_max_size', { type: this.props.t('image'), count: 200, unit: this.props.t('kb') }));
      this.chatAvatarInputRef.value = '';
      return;
    }

    if (Validators.fileType('image')(file)) {
      this.props.showNotification(this.props.t('file_type', { type: this.props.t('image') }));
      this.chatAvatarInputRef.value = '';
      return;
    }

    if (Validators.fileExtensions(['jpeg', 'png'])(file)) {
      this.props.showNotification(this.props.t('file_extensions', { extensions: '"jpeg", "png"' }));
      this.chatAvatarInputRef.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      api.updateGroup({ subscription_id: this.props.details.id, icon: reader.result }).then(data => {
        this.props.updateSubscription({
          ...this.props.details,

          group: {
            ...this.props.details.group,
            icon: data.group.icon,
          },
        });

        this.chatAvatarInputRef.value = '';
      }).catch(error => this.props.showNotification(this.props.t(error.code)));
    };

    reader.readAsDataURL(file);
  };

  resetChatAvatar = () => {
    // сделать репорт - иконка не сбрасывается
    api.updateGroup({ subscription_id: this.props.details.id, icon: null }).then(data => {
      this.props.updateSubscription({
        ...this.props.details,

        group: {
          ...this.props.details.group,
          icon: data.group.icon,
        },
      });

      this.chatAvatarInputRef.value = '';
    }).catch(error => this.props.showNotification(this.props.t(error.code)));
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.details && nextProps.details.group.name !== this.chatName) {
      this.setState({ chatName: nextProps.details.group.name });
    }
  }

  renderLoading = () => <Fragment>
    <Loading isShown className={style.loading} />
  </Fragment>;

  renderPanel = () => {
    const chatName = getChatName(this.props.details);
    const countParticipants = this.props.details.group.participants.length;
    const currentUserParticipant = this.props.currentUser && find(this.props.details.group.participants, { user_id: this.props.currentUser.id });
    const isCurrentUserAdmin = currentUserParticipant && currentUserParticipant.role === 'admin';
    const isChatRoom = this.props.details.group.type === 'room';
    const isRoomWithIcon = isChatRoom && !!this.props.details.group.icon;
    const isInviteCodeBlockShown = isChatRoom && isCurrentUserAdmin && this.props.details.invite_code;

    return <Fragment>
      <Button appearance="_icon-transparent" icon="arrow-left" onClick={this.closePanel} className={style.close} />

      <div className={style.scroll}>
        <div className={style.header}>
          <div className={style.avatar_container}>
            <SubscriptionAvatar subscription={this.props.details} className={style.avatar} />

            {isChatRoom &&
              <button onClick={this.browseEditPhoto} className={style.edit}>Edit</button>
            }

            {isRoomWithIcon &&
              <button className={style.close} onClick={this.resetChatAvatar}>
                <Icon name="close" />
              </button>
            }
          </div>

          <input type="file" className={style.change_photo_input} ref={node => this.chatAvatarInputRef = node} onChange={this.onAvatarInputChange} />

          {isChatRoom && isCurrentUserAdmin &&
            <input
              type="text"
              className={style.chat_name_input}
              value={this.state.chatName}
              onChange={() => {}}
              onInput={this.onChatNameInput}
              onBlur={this.onChatNameBlur}
              size={this.state.chatName.length === 0 ? 1 : this.state.chatName.length}
            />
          }

          {!(isChatRoom && isCurrentUserAdmin) &&
            <p className={style.name}>{chatName}</p>
          }

          <p className={style.subcaption}>
            {isChatRoom &&
              `${countParticipants} ${this.props.t('people')}`
            }

            {!isChatRoom &&
              this.props.t('not_active')
            }
          </p>
        </div>

        {isInviteCodeBlockShown &&
          <Fragment>
            <input
              type="text"
              className={style.copy_input}
              ref={node => this.inviteCodeInputRef = node}
              onChange={() => {}}
              {...this.props.details.invite_code ? {value: `${location.origin}/invite/${this.props.details.invite_code}`} : {}}
              readOnly
            />

            <button className={style.setting_button} onClick={this.copyInviteLink}>
              <Icon name="share" />
              <p className={style.text}>{this.props.t('copy_invite_link')}</p>
            </button>
          </Fragment>
        }

        <button className={style.setting_button} onClick={this.toggleMute}>
          {this.props.details.mute_until &&
            <Icon name="mute" />
          }

          {!this.props.details.mute_until &&
            <Icon name="unmute" />
          }

          <p className={style.text}>{this.props.t('notifications')}</p>
        </button>

        <Dropdown
          uniqueId="panel-category-dropdown"
          className={style.dropdown}

          items={[
            { text: this.props.t('all'), onClick: () => this.setTag([null]) },
            { text: this.props.t('work'), onClick: () => this.setTag(['work']) },
            { text: this.props.t('personal'), onClick: () => this.setTag(['personal']) },
          ]}
        >
          <button className={style.setting_button}>
            <Icon name="folder" />
            <p className={style.text}>{this.props.t('category')}</p>

            {this.props.details.tags && this.props.details.tags[0] &&
              <span>
                {this.props.details.tags[0] === 'work' && this.props.t('work')}
                {this.props.details.tags[0] === 'personal' && this.props.t('personal')}
              </span>
            }
          </button>
        </Dropdown>

        {isChatRoom &&
          <button className={cx('setting_button', 'leave')} onClick={this.leaveChat}>
            <Icon name="close" />
            <p className={style.text}>{this.props.t('leave_chat')}</p>
          </button>
        }

        {this.props.details.group.type === 'room' &&
          <div className={cx('collapse', { '_is-open': this.state.collapseActive === 'people' })}>
            <button className={style.collapse_button} onClick={this.toggleCollapse('people')}>
              <span className={style.title}>{this.props.t('people')}</span>

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
                  peopleDropdownItems.push({text: this.props.t('message'), onClick: () => this.goToChatByUserId(user.id)});
                }

                if (isCurrentUserAdmin) {
                  if (participant.role !== 'admin') {
                    peopleDropdownItems.push({text: this.props.t('set_admin'), onClick: () => this.setAccess(user.id, 'admin')});
                  }

                  if (participant.role !== 'rw') {
                    peopleDropdownItems.push({text: this.props.t('set_read_write'), onClick: () => this.setAccess(user.id, 'rw')});
                  }

                  if (participant.role !== 'ro') {
                    peopleDropdownItems.push({text: this.props.t('set_read_only'), onClick: () => this.setAccess(user.id, 'ro')});
                  }

                  if (participant.user_id !== this.props.currentUser.id) {
                    peopleDropdownItems.push({text: this.props.t('remove'), onClick: () => this.removeUser(user.id), isDanger: true});
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
      </div>
    </Fragment>;
  };

  render() {
    return <div className={cx('panel', this.props.className, { '_is-shown': this.props.isShown })}>
      {!this.props.details && this.renderLoading()}
      {this.props.details && this.renderPanel()}
    </div>;
  }
}

export default compose(
  withRouter,
  withDetails,
  withNamespaces('translation'),

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
