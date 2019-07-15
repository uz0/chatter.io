import map from 'lodash/map';
import find from 'lodash/find';

export default (subscriptions_list, params) => {
  if (params.chatId) {
    return subscriptions_list[params.chatId];
  }

  let details = null;

  map(subscriptions_list, subscription => {
    if (subscription.group.type !== 'private_chat') {
      return;
    }

    const opponent = find(subscription.group.participants, {user_id: parseInt(params.userId, 10)});

    if (opponent) {
      details = subscriptions_list[subscription.id];
    }
  });

  return details;
};
