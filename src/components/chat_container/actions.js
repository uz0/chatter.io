import find from 'lodash/find';
import isEqual from 'lodash/isEqual';
import get from 'lodash/get';
import { api } from '@';
import { actions as messagesActions } from '@/store/messages';
import { actions as subscriptionsActions } from '@/store/subscriptions';
import { actions as usersActions } from '@/store/users';
import { getOpponentUser } from '@/helpers';

const getChatUrl = subscription => {
  if (subscription.group.type === 'private_chat') {
    return `/chat/user/${getOpponentUser(subscription).id}`;
  }

  return `/chat/${subscription.id}`;
};

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

  function showWebNotification(message) {
    if (Notification.permission === 'denied') {
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

    const audio = new Audio('/assets/notification.mp3');
    const promise = audio.play();

    if (promise !== undefined) {
      promise.catch(error => {
        console.error(error);
      });
    }

    const notification = new Notification(user.nick || 'no nick', {
      body: `${message.text.substr(0, 50)}${message.text.length > 50 ? '...' : ''}`,
      icon: get(user, 'avatar.small', `${location.host}/assets/default-user.jpg`),
    });

    if (document.hidden) {
      notification.onclick = () => window.open(`${location.host}${getChatUrl(subscription)}`, '_blank');
    } else {
      notification.onclick = () => location.replace(`${getChatUrl(subscription)}`);
    }
  }

  function onEntering() {
    const subscription = find(state.subscriptions.list, { group_id: notification.object.group_id });
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
      if (!notification.object.xtag && document.hidden) {
        showWebNotification(notification.object);
      }

      if (find(notification.object.mentions, {user_id: state.currentUser.id}) && !document.hidden) {
        showWebNotification(notification.object);
      }

      // Не добавляем сообщение, просто удаляем чат
      if (notification.object.xtag === 'leave' && !notification.object.reference.id) {
        dispatch(subscriptionsActions.removeSubscription(messageSubscription.id));
        return;
      }

      if (notification.object.xtag === 'invite' || notification.object.xtag === 'kick_out') {
        api.getSubscription({subscription_id: messageSubscription.id})
          .then(data => dispatch(subscriptionsActions.updateSubscription(data.subscription)));
      }

      if (state.messages.list[notification.object.uid] || state.messages.list[notification.object.id]) {
        dispatch(messagesActions.updateMessage({chatId: messageSubscription.id, message: notification.object}));
      } else {
        dispatch(messagesActions.addMessage({chatId: messageSubscription.id, message: notification.object}));
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