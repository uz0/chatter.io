import map from 'lodash/map';
import filter from 'lodash/filter';
import find from 'lodash/find';
import { getChatName } from '@/helpers';
import actions from './actions';
import { createReducer } from 'redux-starter-kit';

const initialState = {
  ids: [],
  list: {},
  hover_subscription_id: null,
  filter_text: '',
  filtered_ids: [],
  filtered_messages: {},
  filtered_contacts_ids: [],
  filtered_global_users: [],
  filter_tag: 'all',
  is_searching_old_messages: false,
};

export default createReducer(initialState, {
  [actions.types.loadSubscriptions]: (state, action) => {
    action.payload.forEach(subscription => {
      if (state.ids.indexOf(subscription.id) !== -1) {
        return;
      }

      state.ids.push(subscription.id);
      state.filtered_ids.push(subscription.id);
      state.list[subscription.id] = subscription;
    });
  },

  [actions.types.addSubscription]: (state, action) => {
    if (state.ids.indexOf(action.payload.id) !== -1) {
      return;
    }

    state.ids.push(action.payload.id);
    state.filtered_ids.push(action.payload.id);
    state.list[action.payload.id] = action.payload;
  },

  [actions.types.addArraySubscriptions]: (state, action) => {
    action.payload.forEach(subscription => {
      if (state.ids.indexOf(subscription.id) !== -1) {
        return;
      }

      state.ids.push(subscription.id);
      state.filtered_ids.push(subscription.id);
      state.list[subscription.id] = subscription;
    });
  },

  [actions.types.updateSubscription]: (state, action) => {
    if (state.list[action.payload.id]) {
      state.list[action.payload.id] = {
        ...state.list[action.payload.id],
        ...action.payload,
      };
    }
  },

  [actions.types.setHoverSubscription]: (state, action) => {
    state.hover_subscription_id = action.payload;
  },

  [actions.types.removeSubscription]: (state, action) => {
    state.ids.splice(state.ids.indexOf(action.payload), 1);
    delete state.list[action.payload];

    if (state.filtered_ids.indexOf(action.payload) !== -1) {
      state.filtered_ids.splice(state.filtered_ids.indexOf(action.payload), 1);
    }
  },

  [actions.types.toggleSearchMessages]: (state, action) => {
    state.is_searching_old_messages = action.payload;
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
    state.filtered_global_users = [];

    if (state.filter_text) {
      state.filtered_contacts_ids = filter(state.ids, id => getChatName(state.list[id]).toLowerCase().startsWith(state.filter_text.toLowerCase()));

      map(action.payload.messages.list, message => {
        if (!message.text || message.xtag) {
          return;
        }

        if (!message.text.toLowerCase().match(state.filter_text.toLowerCase())) {
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

    if (action.payload.global_users) {
      state.filtered_global_users = filter(action.payload.global_users, user => {
        let isUserExist = false;

        map(state.filtered_contacts_ids, id => {
          const subscription = state.list[id];

          if (find(subscription.group.participants, { user_id: user.id })) {
            isUserExist = true;
          }
        });

        return !isUserExist;
      });
    }
  },

  [actions.types.clearSubscriptions]: state => {
    state.ids = [];
    state.list = {};
    state.filter_text = '';
    state.filtered_ids = [];
    state.filtered_messages = {};
    state.filtered_contacts_ids = [];
    state.filtered_global_users = [];
    state.filter_tag = 'all';
  },
});
