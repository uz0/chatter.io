import find from 'lodash/find';
import { actions as messagesActions } from '@/store/messages';

const notificationReceived = notification => (dispatch, getState) => {
  const state = getState();

  if (notification.object_type === 'message') {
    onMessage();
  }

  function onMessage() {
    const messageSubscription = find(state.subscriptions.list, { group_id: notification.object.group_id });

    if (notification.event === 'new') {
      // Если текущий пользователь покидает чат, не добавлять xtag сообщение
      // В input-container при выходе из чата отправляется запрос на последнее прочитанное сообщение
      // И из-за нового неотправленного сообщения получается, что отправляется запрос на уже удаленный чат
      if (notification.object.xtag === 'leave' && !notification.object.reference.id) {
        return;
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
  }
};

export default { notificationReceived };