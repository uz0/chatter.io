import actions from './actions';
import map from 'lodash/map';

const initialState = {
  ids: [],
  list: {},
};

export default (state = initialState, action) => {
  if (action.type === actions.types.loadSubscriptionsIds) {
    return {
      ...state,
      ids: [...state.ids, ...map(action.payload, 'id')],
    };
  }

  if (action.type === actions.types.loadSubscription) {
    let list = {...state.list};

    list[action.payload.id] = action.payload;

    return {
      ...state,
      list,
    };
  }

  if (action.type === actions.types.addSubscription) {
    let ids = [ ...state.ids ];
    let list = { ...state.list };

    if (ids.indexOf(action.payload.id) !== -1) {
      return state;
    }

    ids.push(action.payload.id);
    list[action.payload.id] = action.payload;

    return {
      ...state,
      ids,
      list,
    };
  }

  if (action.type === actions.types.updateSubscription) {
    let list = { ...state.list };

    list[action.payload.id] = {
      ...list[action.payload.id],
      ...action.payload,
    };

    return {
      ...state,
      list,
    };
  }

  if (action.type === actions.types.removeSubscription) {
    let ids = [ ...state.ids ];
    let list = { ...state.list };
    ids.splice(ids.indexOf(action.payload), 1);
    delete list[action.payload];

    return {
      ...state,
      ids,
      list,
    };
  }

  if (action.type === actions.types.clearSubscriptions) {
    return {
      ids: [],
      list: {},
    };
  }

  return state;
};
