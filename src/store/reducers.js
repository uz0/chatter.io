import { combineReducers } from 'redux';
import { reducers as formReducers } from '@/components/form';
import { reducers as dropdownReducers } from '@/components/dropdown';
import { reducers as notificationReducers } from '@/components/notification';
import { reducers as modalReducers } from '@/components/modal_container';
import { reducers as subscriptionsReducers } from '@/store/subscriptions';
import { reducers as usersReducers } from '@/store/users';
import { reducers as messagesReducers } from '@/store/messages';

import actions from './actions';

const currentUserReducer = (state = null, action) => {
  if (action.type === actions.types.setCurrentUser) {
    return action.payload;
  }

  return state;
};

const deviceReducer = (state = null, action) => {
  if (action.type === actions.types.setDevice) {
    return action.payload;
  }

  return state;
};

const errorReducer = (state = null, action) => {
  if (action.type === actions.types.setError) {
    return action.payload;
  }

  return state;
};

export default combineReducers({
  currentUser: currentUserReducer,
  forms: formReducers,
  notification: notificationReducers,
  dropdown: dropdownReducers,
  subscriptions: subscriptionsReducers,
  messages: messagesReducers,
  users: usersReducers,
  modal: modalReducers,
  device: deviceReducer,
  error: errorReducer,
});
