import map from 'lodash/map';
import filter from 'lodash/filter';
import find from 'lodash/find';
import { getChatName } from '@/helpers';
import actions from './actions';
import { createReducer } from 'redux-starter-kit';

const initialState = {
  ids: [],
  list: {},
  filter_text: '',
  filtered_ids: [],
  filtered_contacts_ids: [],
  filter_tag: 'all',
};

export default createReducer(initialState, {
  [actions.types.loadSubscriptionsIds]: (state, action) => {
    const ids = [...state.ids, ...map(action.payload, 'id')];
    state.ids = ids;
    state.filtered_ids = ids;
  },

  [actions.types.loadSubscription]: (state, action) => {
    state.list[action.payload.id] = action.payload;
  },

  [actions.types.addSubscription]: (state, action) => {
    if (state.ids.indexOf(action.payload.id) !== -1) {
      return;
    }

    state.ids.push(action.payload.id);
    state.filtered_ids.push(action.payload.id);
    state.list[action.payload.id] = action.payload;
  },

  [actions.types.updateSubscription]: (state, action) => {
    state.list[action.payload.id] = {
      ...state.list[action.payload.id],
      ...action.payload,
    };
  },

  [actions.types.removeSubscription]: (state, action) => {
    state.ids.splice(state.ids.indexOf(action.payload), 1);
    delete state.list[action.payload];

    if (state.filtered_ids.indexOf(action.payload) !== -1) {
      state.filtered_ids.splice(state.filtered_ids.indexOf(action.payload), 1);
    }
  },

  [actions.types.search]: (state, action) => {
    if (action.payload.text) {
      state.filter_text = action.payload.text;
    }

    if (action.payload.tag) {
      state.filter_tag = action.payload.tag;
    }

    if (!action.payload.text && !state.filter_text) {
      state.filter_text = '';
      state.filtered_ids = state.ids;
      state.filtered_contacts_ids = state.ids;
    }

    if (!action.payload.text && !action.payload.tag && !!state.filter_text) {
      state.filter_text = '';
      state.filtered_ids = state.ids;
      state.filtered_contacts_ids = state.ids;
    }

    if (state.filter_text) {
      state.filtered_contacts_ids = filter(state.ids, id => getChatName(state.list[id]).toLowerCase().match(state.filter_text));

      let filtered_ids = [];

      map(action.payload.messages.list, message => {
        if (message.text && message.text.toLowerCase().match(state.filter_text.toLowerCase())) {
          const chatId = find(state.list, { group_id: message.group_id }).id
          filtered_ids.push(chatId);
        }
      });

      state.filtered_ids = filtered_ids;
    }

    if (state.filter_tag && state.filter_tag !== 'all') {
      state.filtered_contacts_ids = filter(state.filtered_contacts_ids, id => state.list[id].tags && state.list[id].tags[0] === state.filter_tag);
      state.filtered_ids = filter(state.filtered_ids, id => state.list[id].tags && state.list[id].tags[0] === state.filter_tag);
    }
  },

  [actions.types.clearSubscriptions]: (state) => {
    state = {
      ids: [],
      list: {},
      filter_text: '',
      filtered_ids: [],
      filtered_contacts_ids: [],
      filter_tag: 'all',
    };
  },
});












// import actions from './actions';
// import map from 'lodash/map';
// import filter from 'lodash/filter';
// import { getChatName } from '@/helpers';

// const initialState = {
//   filter_search: '',
//   filter_tag: 'all',
//   filtered_ids: [],
//   ids: [],
//   list: {},
// };

// export default (state = initialState, action) => {
//   if (action.type === actions.types.loadSubscriptionsIds) {
//     const ids = [...state.ids, ...map(action.payload, 'id')];

//     return {
//       ...state,
//       ids,
//       filtered_ids: ids,
//     };
//   }

//   if (action.type === actions.types.loadSubscription) {
//     let list = {...state.list};

//     list[action.payload.id] = action.payload;

//     return {
//       ...state,
//       list,
//     };
//   }

//   if (action.type === actions.types.addSubscription) {
//     let ids = [ ...state.ids ];
//     let filtered_ids = [ ...state.filtered_ids ];
//     let list = { ...state.list };

//     if (ids.indexOf(action.payload.id) !== -1) {
//       return state;
//     }

//     filtered_ids.push(action.payload.id);
//     ids.push(action.payload.id);
//     list[action.payload.id] = action.payload;

//     return {
//       ...state,
//       ids,
//       filtered_ids,
//       list,
//     };
//   }

//   if (action.type === actions.types.updateSubscription) {
//     let list = { ...state.list };

//     list[action.payload.id] = {
//       ...list[action.payload.id],
//       ...action.payload,
//     };

//     return {
//       ...state,
//       list,
//     };
//   }

//   if (action.type === actions.types.removeSubscription) {
//     let ids = [ ...state.ids ];
//     let list = { ...state.list };
//     let filtered_ids = [ ...state.filtered_ids ];
//     ids.splice(ids.indexOf(action.payload), 1);

//     if (filtered_ids.indexOf(action.payload) !== -1) {
//       filtered_ids.splice(filtered_ids.indexOf(action.payload), 1);
//     }

//     delete list[action.payload];

//     return {
//       ...state,
//       ids,
//       filtered_ids,
//       list,
//     };
//   }

//   if (action.type === actions.types.filterSubscription) {
//     let filter_tag = state.filter_tag;
//     let filter_search = state.filter_search;
//     let ids = [ ...state.ids ];
//     let list = { ...state.list };
//     let filtered_ids = ids;

//     if (action.payload.name) {
//       filter_search = action.payload.name;
//     }

//     if (action.payload.tag) {
//       filter_tag = action.payload.tag;
//     }

//     if (!action.payload.name && !action.payload.tag) {
//       filter_search = '';
//     }

//     if (filter_search) {
//       filtered_ids = filter(filtered_ids, id => getChatName(list[id]).toLowerCase().match(filter_search));
//     }

//     if (filter_tag && filter_tag !== 'all') {
//       filtered_ids = filter(filtered_ids, id => list[id].tags && list[id].tags[0] === filter_tag);
//     }

//     return {
//       ...state,
//       filter_tag,
//       filter_search,
//       ids,
//       filtered_ids,
//       list,
//     };
//   }

//   if (action.type === actions.types.clearSubscriptions) {
//     return {
//       filter_search: '',
//       filter_tag: 'all',
//       filtered_ids: [],
//       ids: [],
//       list: {},
//     };
//   }

//   return state;
// };
