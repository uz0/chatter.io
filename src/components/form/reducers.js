import set from 'lodash/set';
import actions from './actions';
import { createReducer } from 'redux-starter-kit';

const initialState = {
  register: {},
  login: {},
  forgot: {},
  profile: {},
  new_company: {},
  edit_company: {},
  edit_task: {},
};

export default createReducer(initialState, {
  [actions.types.formChange]: (state, action) => {
    const modelArray = action.model.split('.');

    if (modelArray.length === 1) {
      state[modelArray[0]] = action.data;
      return;
    }

    state[modelArray[0]] = set(state[modelArray[0]], modelArray.splice(1).join('.'), action.data);
  },

  [actions.types.formReset]: (state, action) => {
    state[action.model] = {};
  },
});
