import actions from './actions';
import { createReducer } from 'redux-starter-kit';

const initialState = {
  ids: [],
  list: {},
};

export default createReducer(initialState, {
  [actions.types.addUser]: (state, action) => {
    if (state.list[action.payload.id]) {
      return;
    }

    state.list[action.payload.id] = action.payload;
    state.ids.push(action.payload.id);
  },

  [actions.types.addUsers]: (state, action) => {
    action.payload.forEach(participant => {
      const user = participant.user;

      if (state.list[user.id]) {
        return;
      }

      state.list[user.id] = user;
      state.ids.push(user.id);
    });
  },

  [actions.types.updateUser]: (state, action) => {
    state.list[action.payload.id] = {
      ...state.list[action.payload.id],
      ...action.payload,
    };
  },

  [actions.types.clearUsers]: state => {
    state.ids = [];
    state.list = {};
  },
});
