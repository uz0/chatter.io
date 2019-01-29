import set from 'lodash/set';
import actions from './actions';

const initialState = {
  register: {},
  login: {},
  forgot: {},
  profile: {},
};

export default (state = initialState, action) => {
  if (action.type === actions.types.formChange) {
    return {
      ...state,
      ...set(state, action.model, action.data),
    };
  }

  if (action.type === actions.types.formReset) {
    return {
      ...state,
      [action.model]: {},
    };
  }

  return state;
};
