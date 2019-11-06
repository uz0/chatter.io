import pickBy from 'lodash/pickBy';
import has from 'lodash/has';
import isEmpty from 'lodash/isEmpty';

export default (subscriptions, messages) => {
  if (!subscriptions || !messages || isEmpty(messages.chatIds)) {
    return 0;
  }

  let messagesCounter = 0;
  
  // Пока что так, непонятно, какой значение должен иметь тип для чатов организаций
  const subscriptionsList = pickBy(subscriptions.list, sub => sub.group.type);

  for (const subscription of Object.values(subscriptionsList)) {
    if (!has(messages.chatIds, subscription.id)) {
      continue;
    }

    const chatMessagesListId = messages.chatIds[subscription.id].list[0];
    const subscriptionChatMessages = messages.list[chatMessagesListId];

    if (!chatMessagesListId || !subscriptionChatMessages || !subscription.last_read_message_id) {
      continue;
    }

    const messagesDelta = subscriptionChatMessages.id - subscription.last_read_message_id;

    if (messagesDelta === 0) {
      continue;
    }

    messagesCounter += messagesDelta;
  }

  return messagesCounter;
};
