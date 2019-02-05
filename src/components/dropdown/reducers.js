import actions from './actions';

export default (state = {}, action) => {
  if (action.type === actions.types.openDropdown) {
    let newState = { ...state };

    Object.keys(newState).forEach(key => {
      newState[key].isShown = key === action.payload.uniqueId;
    });

    return {
      ...newState,

      [action.payload.uniqueId]: {
        isShown: true,
        ...action.payload.options,
      },
    };
  }

  if (action.type === actions.types.closeDropdown) {
    return {
      ...state,

      [action.payload]: {
        ...state[action.payload],
        isShown: false,
      },
    };
  }

  if (action.type === actions.types.clearDropdowns) {
    return {};
  }

  return state;
};
