import { combineReducers } from 'redux';
import { reducers as formReducers } from '@/components/form';
import { reducers as notificationReducers } from '@/components/notification';

import actions from './actions';

const currentUserReducer = (state = null, action) => {
  if (action.type === actions.types.setCurrentUser) {
    return action.payload;
  }

  return state;
};

export default combineReducers({
  currentUser: currentUserReducer,
  forms: formReducers,
  notification: notificationReducers,
});
