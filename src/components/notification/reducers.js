import actions from './actions';
import { createReducer } from 'redux-starter-kit';

const initialState = {
  isShown: false,
  text: '',
  type: '',
};

export default createReducer(initialState, {
  [actions.types.showNotification]: (state, action) => {
    state.isShown = true;
    state.text = action.payload.text;

    if (action.payload.type) {
      state.type = action.payload.type;
    }
  },

  [actions.types.hideNotification]: state => {
    state.isShown = false;
    state.text = '';
    state.type = '';
  },
});
