import get from 'lodash/get';
import { getOpponentUser } from '@/helpers';

export default subscription => {
  if (subscription.group.type === 'room' || subscription.group.type === 'global_channel') {
    return subscription.group.name || 'no name';
  }

  return get(getOpponentUser(subscription), 'nick', 'no nick') || 'no name';
};
