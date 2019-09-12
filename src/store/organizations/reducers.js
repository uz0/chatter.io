import actions from './actions';
import { createReducer } from 'redux-starter-kit';

const initialState = {
  ids: [],
  list: {},
  isLoaded: false,
};

export default createReducer(initialState, {
  [actions.types.loadOrganizations]: (state, action) => {
    action.payload.forEach(org => {
      if (state.ids.indexOf(org.id) !== -1) {
        return;
      }

      state.ids.push(org.id);
      state.list[org.id] = org;
    });

    state.isLoaded = true;
  },

  [actions.types.clearOrganizations]: state => {
    state.ids = [];
    state.list = {};
    state.isLoaded = false;
  },
});
