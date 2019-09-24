import isEmpty from 'lodash/isEmpty';
import { getOpponentUser } from '@/helpers';

const isPrivateChat = subscription => {
  if (subscription.group.type === 'private_chat' && !isEmpty(getOpponentUser(subscription))) {
    return true;
  }

  return false;
};

export default subscription => {
  const isPrivate = isPrivateChat(subscription);

  if (subscription.group.organization_id) {
    if (isPrivate) {
      return `/${subscription.group.organization_id}/chat/user/${getOpponentUser(subscription).id}`;
    }

    return `/${subscription.group.organization_id}/chat/${subscription.id}`;
  }

  if (isPrivate) {
    return `/chat/user/${getOpponentUser(subscription).id}`;
  }

  return `/chat/${subscription.id}`;
};
