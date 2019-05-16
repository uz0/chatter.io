import find from 'lodash/find';
import isEqual from 'lodash/isEqual';
import get from 'lodash/get';
import reject from 'lodash/reject';
import { api } from '@';
import { actions as messagesActions } from '@/store/messages';
import { actions as subscriptionsActions } from '@/store/subscriptions';
import { actions as usersActions } from '@/store/users';
import config from '@/config';

const notificationReceived = notification => (dispatch, getState) => {
  const state = getState();

  if (notification.object_type === 'message') {
    onMessage();
  }

  if (notification.object_type === 'subscription' || notification.object_name === 'subscription') {
    onSubscription();
  }

  if (notification.object_type === 'user') {
    onUser();
  }

  if (notification.event === 'entering') {
    onEntering(notification);
  }

  async function showWebNotification(message) {
    if (!window.firebase) {
      return;
    }

    if (message.user_id === state.currentUser.id) {
      return;
    }

    const user = state.users.list[message.user_id];
    const subscription = find(state.subscriptions.list, { group_id: message.group_id });

    if (subscription.mute_until) {
      return;
    }

    const messaging = window.firebase.messaging();
    await messaging.requestPermission();

    if (Notification.permission === 'denied') {
      return;
    }

    try {
      const currentToken = await messaging.getToken();

      fetch('https://fcm.googleapis.com/fcm/send', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `key=${config.firebase_server_key}`,
        },

        method: 'POST',

        body: JSON.stringify({
          notification: {
            title: 'New Message',
            body: `${message.text.substr(0, 50)}${message.text.length > 50 ? '...' : ''}`,
            click_action: location.href,
            icon: get(user, 'avatar.small', `${location.host}/assets/default-user.jpg`),
            sound: 'default',
          },

          to: currentToken,
        }),
      });
    } catch (error) {
      console.error(error);
    }
  }

  async function onEntering() {
    const subscription = find(state.subscriptions.list, { group_id: notification.object.group_id });

    if (!subscription) {
      const response = await api.getPrivateSubscription({ user_id: notification.object.user_id });
      dispatch(subscriptionsActions.addSubscription(response.subscription));
      return;
    }

    const user_id = notification.object.user_id;

    if (user_id === state.currentUser.id) {
      return;
    }

    const typings = subscription.typings || {};

    if (!state.users.list[notification.object.user_id]) {
      api.getUser({ user_id }).then(data => dispatch(usersActions.addUser(data.user)));
    }

    if (typings[user_id]) {
      clearTimeout(typings[user_id].timeout);
    }

    const timeout = setTimeout(() => {
      delete typings[user_id];
      dispatch(subscriptionsActions.updateSubscription({...subscription, typings}));
    }, 3000);

    typings[user_id] = {
      id: user_id,
      timeout,
    };

    dispatch(subscriptionsActions.updateSubscription({...subscription, typings}));
  }

  function onUser() {
    if (notification.event === 'changed') {
      if (state.users.list[notification.object.id]) {
        dispatch(usersActions.updateUser(notification.object));
      } else {
        dispatch(usersActions.addUser(notification.object));
      }
    }
  }

  function onSubscription() {
    if (notification.event === 'new' && notification.object.user_id === state.currentUser.id) {
      if (state.subscriptions.ids.length === 0 || state.subscriptions.list[notification.object.id]) {
        return;
      }

      api.getSubscription({subscription_id: notification.object.id}).then(data => {
        dispatch(usersActions.addUsers(data.subscription.group.participants));
        dispatch(subscriptionsActions.addSubscription(data.subscription));

        const currentUserParticipant = state.currentUser && find(data.subscription.group.participants, { user_id: state.currentUser.id });
        const isCurrentUserAdmin = currentUserParticipant && currentUserParticipant.role === 'admin';

        if (data.subscription.group.type === 'room' && isCurrentUserAdmin) {
          api.createGroupInviteCode({ subscription_id: data.subscription.id }).then(inviteCodeData => {
            dispatch(subscriptionsActions.updateSubscription({
              ...data.subscription,
              invite_code: inviteCodeData.code,
            }));
          });
        }
      });
    }

    if (notification.event === 'changed') {
      const subscription = find(state.subscriptions.list, { group_id: notification.object.group_id });

      if (!subscription) {
        return;
      }

      api.getSubscription({subscription_id: subscription.id}).then(data => {
        dispatch(subscriptionsActions.updateSubscription(data.subscription));

        if (!isEqual(subscription.tags, data.subscription.tags)) {
          dispatch(subscriptionsActions.filterSubscription({ tag: state.subscriptions.filter_tag }));
        }
      });
    }
  }

  function onMessage() {
    const messageSubscription = find(state.subscriptions.list, { group_id: notification.object.group_id });

    if (!messageSubscription) {
      return;
    }

    if (notification.event === 'new') {
      if (!notification.object.xtag && 'Notification' in window && Notification.permission !== 'denied') {
        showWebNotification(notification.object);
      }

      if (notification.object.xtag === 'invite' || notification.object.xtag === 'joined' || notification.object.xtag === 'kick_out') {
        api.getSubscription({subscription_id: messageSubscription.id}).then(data => {
          dispatch(subscriptionsActions.updateSubscription(data.subscription));
          dispatch(usersActions.addUsers(data.subscription.group.participants));
        });
      }

      if (notification.object.xtag === 'leave' && !notification.object.reference.id) {
        if (state.currentUser.id === notification.object.user_id) {
          dispatch(subscriptionsActions.removeSubscription(messageSubscription.id));
          return;
        }

        let leavingSubscription = find(state.subscriptions.list, { group_id: notification.object.group_id });

        if (!leavingSubscription) {
          return;
        }

        leavingSubscription.group.participants = reject(leavingSubscription.group.participants, { user_id: notification.object.user_id });
        dispatch(subscriptionsActions.updateSubscription(leavingSubscription));
      }

      if (state.messages.list[notification.object.uid] || state.messages.list[notification.object.id]) {
        dispatch(messagesActions.updateMessage({chatId: messageSubscription.id, message: notification.object}));
      } else {
        const messagesScrollElement = document.getElementById('messages-scroll');
        const isScrolledToBottom = messagesScrollElement && messagesScrollElement.scrollTop === (messagesScrollElement.scrollHeight - messagesScrollElement.offsetHeight);

        dispatch(messagesActions.addMessage({chatId: messageSubscription.id, message: notification.object}));

        if (isScrolledToBottom) {
          messagesScrollElement.scrollTo(0, messagesScrollElement.scrollHeight);
        }
      }
    }

    if (notification.event === 'changed') {
      let message = notification.object;

      // В редьюсерах updateMessage мержит приходящее сообщение с существующим.
      // Если какое нибудь поле было сброшено - это не отобразится.
      // Поэтому обнуляем вручную
      if (!notification.object.in_reply_to_message_id) {
        message['in_reply_to_message_id'] = null;
        message['replied_message'] = null;
      }

      if (!notification.object.attachment) {
        message['attachment'] = null;
      }

      if (state.messages.list[message.id]) {
        dispatch(messagesActions.updateMessage({chatId: messageSubscription.id, message}));
      }
    }

    if (notification.event === 'deleted') {
      if (state.messages.list[notification.object.id]) {
        dispatch(messagesActions.updateMessage({ chatId: messageSubscription.id, message: notification.object }));
      }
    }
  }
};

export default { notificationReceived };