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
  filtered_messages: {},
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

    if (!action.payload.text && !action.payload.tag) {
      state.filter_text = '';
    }

    state.filtered_ids = state.ids;
    state.filtered_messages = {};
    state.filtered_contacts_ids = [];

    if (state.filter_text) {
      state.filtered_contacts_ids = filter(state.ids, id => getChatName(state.list[id]).toLowerCase().match(state.filter_text.toLowerCase()));

      map(action.payload.messages.list, message => {
        if (!message.text || !message.text.toLowerCase().match(state.filter_text.toLowerCase())) {
          return;
        }

        const chatId = find(state.list, { group_id: message.group_id }).id;
        const messageId = message.id || message.uid;

        if (!state.filtered_messages[chatId]) {
          state.filtered_messages[chatId] = [messageId];
        } else {
          state.filtered_messages[chatId].push(messageId);
        }
      });

      state.filtered_ids = filter(state.filtered_ids, id => !!state.filtered_messages[id]);
    }

    if (state.filter_tag && state.filter_tag !== 'all') {
      state.filtered_contacts_ids = filter(state.filtered_contacts_ids, id => state.list[id].tags && state.list[id].tags[0] === state.filter_tag);
      state.filtered_ids = filter(state.filtered_ids, id => state.list[id].tags && state.list[id].tags[0] === state.filter_tag);
    }
  },

  [actions.types.clearSubscriptions]: state => {
    state.ids = [];
    state.list = {};
    state.filter_text = '';
    state.filtered_ids = [];
    state.filtered_messages = {};
    state.filtered_contacts_ids = [];
    state.filter_tag = 'all';
  },
});
