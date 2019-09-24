import actions from './actions';
import { createReducer } from 'redux-starter-kit';

const initialState = {
  ids: [],
  list: {},
  isLoaded: false,

  users: {
    ids: [],
    list: {},
  },
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

  [actions.types.addOrganization]: (state, action) => {
    if (state.ids.indexOf(action.payload.id === -1)) {
      state.ids.push(action.payload.id);
      state.list[action.payload.id] = action.payload;
    }
  },

  [actions.types.updateOrganization]: (state, action) => {
    if (state.list[action.payload.id]) {
      state.list[action.payload.id] = {
        ...state.list[action.payload.id],
        ...action.payload,
      };
    }
  },

  [actions.types.loadOrganizationUsers]: (state, action) => {
    action.payload.forEach(user => {
      if (state.users.ids.indexOf(user.id) !== -1) {
        return;
      }

      state.users.ids.push(user.id);
      state.users.list[user.id] = user;

      if (!state.list[user.organization_id]) {
        return;
      }

      if (!state.list[user.organization_id].users_ids) {
        state.list[user.organization_id].users_ids = [];
      }

      state.list[user.organization_id].users_ids.push(user.id);
    });
  },

  [actions.types.addOrganizationUser]: (state, action) => {
    if (state.users.ids.indexOf(action.payload.id) === -1) {
      state.users.ids.push(action.payload.id);
    }

    if (!state.users.list[action.payload.id]) {
      state.users.list[action.payload.id] = action.payload;
    }


    if (!state.list[action.payload.organization_id]) {
      return;
    }

    if (!state.list[action.payload.organization_id].users_ids) {
      state.list[action.payload.organization_id].users_ids = [];
    }

    state.list[action.payload.organization_id].users_ids.push(action.payload.id);
  },

  [actions.types.updateOrganizationUser]: (state, action) => {
    state.users.list[action.payload.id] = {
      ...state.users.list[action.payload.id],
      ...action.payload,
    };
  },

  [actions.types.deleteOrganizationUser]: (state, action) => {
    if (!state.list[action.payload.organization_id]) {
      return;
    }

    if (!state.list[action.payload.organization_id].users_ids) {
      return;
    }

    const index = state.list[action.payload.organization_id].users_ids.indexOf(action.payload.member_id);

    if (index === -1) {
      return;
    }

    state.list[action.payload.organization_id].users_ids.splice(index, 1);
  },

  [actions.types.removeOrganization]: (state, action) => {
    if (state.ids.indexOf(action.payload) !== -1) {
      state.ids.splice(state.ids.indexOf(action.payload), 1);
      delete state.list[action.payload];
    }
  },

  [actions.types.clearOrganizations]: state => {
    state.ids = [];
    state.list = {};
    state.isLoaded = false;
  },
});
