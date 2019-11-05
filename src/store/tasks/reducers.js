import actions from './actions';
import { createReducer } from 'redux-starter-kit';

const initialState = {
  groups: {},
  organizations: {},
  list: {},
};

export default createReducer(initialState, {
  [actions.types.loadTasks]: (state, action) => {
    if (action.payload.length === 0) {
      return;
    }

    action.payload.forEach(task => {
      if (!state.groups[task.group_id]) {
        state.groups[task.group_id] = {
          list: [task.id],
          isLoaded: true,
        };
      } else {
        if (!state.groups[task.group_id].isLoaded) {
          state.groups[task.group_id].isLoaded = true;
        }

        if (state.groups[task.group_id].list.indexOf(task.id) === -1) {
          state.groups[task.group_id].list.push(task.id);
        }
      }

      if (!state.list[task.id]) {
        state.list[task.id] = task;
      }
    });
  },

  [actions.types.addTask]: (state, action) => {
    if (!state.groups[action.payload.group_id]) {
      state.groups[action.payload.group_id] = {
        list: [action.payload.id],
        isLoaded: false,
      };
    } else if (state.groups[action.payload.group_id].list.indexOf(action.payload.id) === -1) {
      state.groups[action.payload.group_id].list.push(action.payload.id);
    }

    if (!state.list[action.payload.id]) {
      state.list[action.payload.id] = action.payload;
    }
  },

  [actions.types.updateTask]: (state, action) => {
    state.list[action.payload.id] = {
      ...state.list[action.payload.id],
      ...action.payload,
    };
  },

  [actions.types.loadOrganizationTasks]: (state, action) => {
    if (action.payload.length === 0) {
      return;
    }

    action.payload.forEach(task => {
      if (!state.groups[task.group_id]) {
        state.groups[task.group_id] = {
          list: [task.id],
          isLoaded: true,
        };
      } else {
        if (!state.groups[task.group_id].isLoaded) {
          state.groups[task.group_id].isLoaded = true;
        }

        if (state.groups[task.group_id].list.indexOf(task.id) === -1) {
          state.groups[task.group_id].list.push(task.id);
        }
      }

      if (!state.list[task.id]) {
        state.list[task.id] = task;
      }
    });

    if (!state.organizations[action.payload[0].organization_id]) {
      state.organizations[action.payload[0].organization_id] = {
        isLoaded: true,
      };
    }

    if (!state.organizations[action.payload[0].organization_id].isLoaded) {
      state.organizations[action.payload[0].organization_id].isLoaded = true;
    }
  },

  [actions.types.loadTaskComments]: (state, action) => {
    if (!state.list[action.payload.id]) {
      return;
    }

    state.list[action.payload.id]['comments'] = {
      ids: [],
      list: [],
      isLoaded: true,
    };

    action.payload.comments.forEach(comment => {
      if (!comment || !comment.id) {
        return;
      }

      state.list[action.payload.id].comments.ids.push(comment.id);
      state.list[action.payload.id].comments.list[comment.id] = comment;
    });
  },

  [actions.types.addTaskComment]: (state, action) => {
    if (!state.list[action.payload.id]) {
      return;
    }

    if (!state.list[action.payload.id].comments) {
      state.list[action.payload.id]['comments'] = {
        ids: [],
        list: [],
        isLoaded: false,
      };
    }

    state.list[action.payload.id].comments.ids.push(action.payload.comment.id);
    state.list[action.payload.id].comments.list[action.payload.comment.id] = action.payload.comment;
  },

  [actions.types.deleteTask]: (state, action) => {
    Object.keys(state.groups).forEach(key => {
      const index = state.groups[key].list.indexOf(action.payload);

      if (index !== -1) {
        state.groups[key].list.splice(index, 1);
      }
    });

    delete state.list[action.payload];
  },
});
