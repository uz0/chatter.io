import actions from './actions';
import { createReducer } from 'redux-starter-kit';

const initialState = {
  groups: {},
  list: {},
};

export default createReducer(initialState, {
  [actions.types.loadTasks]: (state, action) => {
    action.payload.forEach(task => {
      if (!state.groups[task.group_id]) {
        state.groups[task.group_id] = {
          list: [task.id],
          isLoaded: true,
        };
      } else {
        state.groups[task.group_id].list.push(task.id);
      }

      state.list[task.id] = task;
    });
  },

  [actions.types.addTask]: (state, action) => {
    if (!state.groups[action.payload.group_id]) {
      state.groups[action.payload.group_id] = {
        list: [action.payload.id],
        isLoaded: false,
      };
    } else {
      state.groups[action.payload.group_id].list.push(action.payload.id);
    }

    state.list[action.payload.id] = action.payload;
  },
});
