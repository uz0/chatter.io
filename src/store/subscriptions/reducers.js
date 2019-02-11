import actions from './actions';
import map from 'lodash/map';
import filter from 'lodash/filter';
import { getChatName } from '@/helpers';

const initialState = {
  filtered_ids: [],
  ids: [],
  list: {},
};

export default (state = initialState, action) => {
  if (action.type === actions.types.loadSubscriptionsIds) {
    const ids = [...state.ids, ...map(action.payload, 'id')];

    return {
      ...state,
      ids,
      filtered_ids: ids,
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
    let filtered_ids = [ ...state.filtered_ids ];
    let list = { ...state.list };

    if (ids.indexOf(action.payload.id) !== -1) {
      return state;
    }

    filtered_ids.push(action.payload.id);
    ids.push(action.payload.id);
    list[action.payload.id] = action.payload;

    return {
      ...state,
      ids,
      filtered_ids,
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
    let filtered_ids = { ...state.filtered_ids };
    ids.splice(ids.indexOf(action.payload), 1);

    if (filtered_ids.indexOf(action.payload) !== -1) {
      filtered_ids.splice(filtered_ids.indexOf(action.payload), 1);
    }

    delete list[action.payload];

    return {
      ...state,
      ids,
      filtered_ids,
      list,
    };
  }

  if (action.type === actions.types.filterSubscription) {
    let ids = [ ...state.ids ];
    let filtered_ids = [ ...state.filtered_ids ];
    let list = { ...state.list };

    if (action.payload) {
      filtered_ids = filter(ids, id => getChatName(list[id]).toLowerCase().match(action.payload));
    } else {
      filtered_ids = ids;
    }

    return {
      ...state,
      ids,
      filtered_ids,
      list,
    };
  }

  if (action.type === actions.types.clearSubscriptions) {
    return {
      filtered_ids: [],
      ids: [],
      list: {},
    };
  }

  return state;
};
