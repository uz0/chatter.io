import actions from './actions';
import map from 'lodash/map';
import filter from 'lodash/filter';
import { getChatName } from '@/helpers';

const initialState = {
  filter_search: '',
  filter_tag: 'all',
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
    let filtered_ids = [ ...state.filtered_ids ];
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
    let filter_tag = state.filter_tag;
    let filter_search = state.filter_search;
    let ids = [ ...state.ids ];
    let list = { ...state.list };
    let filtered_ids = ids;

    if (action.payload.name) {
      filter_search = action.payload.name;
    }

    if (action.payload.tag) {
      filter_tag = action.payload.tag;
    }

    if (!action.payload.name && !action.payload.tag) {
      filter_search = '';
    }

    if (filter_search) {
      filtered_ids = filter(filtered_ids, id => getChatName(list[id]).toLowerCase().match(filter_search));
    }

    if (filter_tag && filter_tag !== 'all') {
      filtered_ids = filter(filtered_ids, id => list[id].tags && list[id].tags[0] === filter_tag);
    }

    return {
      ...state,
      filter_tag,
      filter_search,
      ids,
      filtered_ids,
      list,
    };
  }

  if (action.type === actions.types.clearSubscriptions) {
    return {
      filter_search: '',
      filter_tag: 'all',
      filtered_ids: [],
      ids: [],
      list: {},
    };
  }

  return state;
};
