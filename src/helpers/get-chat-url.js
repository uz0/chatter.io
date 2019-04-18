import isEmpty from 'lodash/isEmpty';
import { getOpponentUser } from '@/helpers';

export default subscription => {
  if (subscription.group.type === 'private_chat' && !isEmpty(getOpponentUser(subscription))) {
    return `/chat/user/${getOpponentUser(subscription).id}`;
  }

  return `/chat/${subscription.id}`;
};
