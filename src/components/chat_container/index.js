import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames/bind';
import compose from 'recompose/compose';
import isEqual from 'lodash/isEqual';
import { withNamespaces } from 'react-i18next';
import Sidebar from '@/components/sidebar_container';
import Messages from '@/components/messages_container';
import Panel from '@/components/panel_container';
import ModalContainer from '@/components/modal_container';
import { actions as modalActions } from '@/components/modal_container';
import { actions as galleryActions } from '@/components/gallery_container';
import { actions as notificationActions } from '@/components/notification';
import { actions as usersActions } from '@/store/users';
import { actions as subscriptionsActions } from '@/store/subscriptions';
import { actions as messagesActions } from '@/store/messages';
import { api } from '@';
import { withRouter } from '@/hoc';
import actions from './actions';
import style from './style.css';

const cx = classnames.bind(style);

class Chat extends Component {
  handleDocumentKeyDown = event => {
    const isChatOpen = this.props.params.chatId || this.props.params.userId;

    if (isChatOpen && !this.props.isGalleryOpen && event.keyCode === 27) {
      this.props.pushUrl('/chat');
    }

    if (this.props.isGalleryOpen && event.keyCode === 27) {
      this.props.closeGallery();
    }
  };

  async componentWillMount() {
    if (!this.props.currentUser) {
      this.props.pushUrl('/sign-in');
      return;
    }

    if (this.props.router.location.query.inviteuser) {
      api.addContact({nick: this.props.router.location.query.inviteuser.replace('+', ' ')}).then(data => {
        api.getPrivateSubscription({user_id: data.contact.user.id}).then(getChatData => {
          this.props.addUsers(getChatData.subscription.group.participants);
          this.props.addSubscription(getChatData.subscription);
          this.props.pushUrl(`/chat/user/${data.contact.user.id}`, null);
        });
      }).catch(() => {
        this.props.showNotification('user_not_defined');
        this.props.pushUrl('/chat', null);
      });
    }

    if (this.props.router.location.query.invitecode) {
      api.useInviteCode({ code: this.props.router.location.query.invitecode }).then(data => {
        this.props.addUsers(data.subscription.group.participants);
        this.props.addSubscription(data.subscription);
        this.props.pushUrl(`/chat/${data.subscription.id}`, null);
      });
    }
  }

  async componentDidMount() {
    if (api) {
      api.localInterface.onNotificationReceived = data => data.notifications.forEach(notification => {
        this.props.notificationReceived(notification);
      });
    }

    if ('Notification' in window && Notification.permission !== 'denied' && window.firebase) {
      const messaging = window.firebase.messaging();
      messaging.requestPermission();
    }

    window.addEventListener('keydown', this.handleDocumentKeyDown);
  }

  componentWillReceiveProps(nextProps) {
    const isChatExist = this.props.params.chatId || this.props.params.userId;
    const isNextPropsChatWillBeExist = nextProps.params.chatId || nextProps.params.userId;

    if (isChatExist && (!nextProps.params.chatId && !nextProps.params.userId)) {
      this.props.closeModal('panel-container');
      this.props.clearEditMessage();
      this.props.clearReplyMessage();
    }

    if (isNextPropsChatWillBeExist && !isEqual(this.props.params, nextProps.params) && !this.props.isMobile && !this.props.isPanelShown) {
      this.props.toggleModal({ id: 'panel-container' });
    }
  }

  componwntWillUnmount() {
    document.removeEventListener('keydown', this.handleDocumentKeyDown);
  }

  render() {
    const isChatOpen = this.props.params.chatId || this.props.params.userId;

    return <div className={cx('chat', {'_is-open': isChatOpen})}>
      <Sidebar className={style.sidebar} />

      {isChatOpen &&
        <Fragment>
          <Messages params={this.props.params} className={style.messages} />
          <Panel params={this.props.params} className={style.panel} />
        </Fragment>
      }

      <ModalContainer />
    </div>;
  }
}

export default compose(
  withRouter,
  withNamespaces('translation'),

  connect(
    state => ({
      currentUser: state.currentUser,
      isMobile: state.device === 'touch',
      isGalleryOpen: state.gallery.images.length > 0,
      isPanelShown: state.modal.ids.indexOf('panel-container') !== -1,
    }),

    {
      addSubscription: subscriptionsActions.addSubscription,
      addUsers: usersActions.addUsers,
      toggleModal: modalActions.toggleModal,
      closeModal: modalActions.closeModal,
      clearEditMessage: messagesActions.clearEditMessage,
      clearReplyMessage: messagesActions.clearReplyMessage,
      notificationReceived: actions.notificationReceived,
      closeGallery: galleryActions.close,
      showNotification: notificationActions.showNotification,
    },
  ),
)(Chat);
