import actions from './actions';

const initialState = {
  ids: [],
  list: {},
};

export default (state = initialState, action) => {
  if (action.type === actions.types.toggleModal) {
    let stateIds = [ ...state.ids ];
    let stateList = { ...state.list };

    const index = stateIds.indexOf(action.payload.id);

    if (index === -1) {
      stateIds.push(action.payload.id);

      if (action.payload.options) {
        stateList[action.payload.id] = action.payload.options;
      }
    } else {
      delete stateIds[index];

      if (stateList[action.payload.id]) {
        delete stateList[action.payload.id];
      }
    }

    return {
      ids: stateIds,
      list: stateList,
    };
  }

  if (action.type === actions.types.closeModal) {
    let stateIds = [ ...state.ids ];
    let stateList = { ...state.list };
    const index = stateIds.indexOf(action.payload);

    if (index !== -1) {
      delete stateIds[index];
    }

    if (stateList[action.payload]) {
      delete stateList[action.payload];
    }

    return {
      ids: stateIds,
      list: stateList,
    };
  }

  return state;
};
