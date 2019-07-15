import actions from './actions';
import { createReducer } from 'redux-starter-kit';

const initialState = {
  chatIds: {},
  list: {},
  edit_message_id: null,
  forward_message_id: null,
  reply_message_id: null,
};

export default createReducer(initialState, {
  [actions.types.loadMessages]: (state, action) => {
    const chatId = action.payload.chatId;
    const isLoaded = action.payload.isLoaded || false;
    const list = action.payload.list;

    if (state.chatIds[chatId] && state.chatIds[chatId].isLoaded) {
      return;
    }

    state.chatIds[chatId] = {
      isLoaded,
      hasMore: list.length === 50,
      list: [],
    };

    list.forEach(message => {
      state.list[message.id] = message;
      state.chatIds[chatId].list.push(message.id);
    });
  },

  [actions.types.loadMoreMessages]: (state, action) => {
    const chatId = action.payload.chatId;

    action.payload.list.forEach(message => {
      if (state.list[message.id]) {
        return;
      }

      state.list[message.id] = message;
      state.chatIds[chatId].list.push(message.id);
    });

    if (action.payload.list.length < 50) {
      state.chatIds[chatId].hasMore = false;
    }
  },

  [actions.types.addMessage]: (state, action) => {
    const chatId = action.payload.chatId;
    const messageId = action.payload.message.id || action.payload.message.uid;

    if (chatId && !state.chatIds[chatId]) {
      state.chatIds[chatId] = {
        isLoaded: false,
        hasMore: true,
        list: [],
      };
    }

    if (!state.list[messageId]) {
      state.list[messageId] = action.payload.message;
    }

    if (chatId && state.chatIds[chatId] && state.chatIds[chatId].list.indexOf(messageId) === -1) {
      state.chatIds[chatId].list.unshift(messageId);
    }
  },

  [actions.types.updateMessage]: (state, action) => {
    const chatId = action.payload.chatId;
    const message = action.payload.message;

    if (message.uid && message.id) {
      const uidMessageIndex = state.chatIds[chatId].list.indexOf(message.uid);
      state.chatIds[chatId].list[uidMessageIndex] = message.id;
      state.list[message.id] = message;
      delete state.list[message.uid];
    }

    if (message.id && !message.uid) {
      state.list[message.id] = {
        ...state.list[message.id],
        ...message,
      };
    }

    if (!message.id && message.uid) {
      state.list[message.uid] = {
        ...state.list[message.uid],
        ...message,
      };
    }
  },

  [actions.types.addEditMessage]: (state, action) => {
    state.edit_message_id = action.payload;
  },

  [actions.types.clearEditMessage]: state => {
    state.edit_message_id = null;
  },

  [actions.types.addReplyMessage]: (state, action) => {
    state.reply_message_id = action.payload;
  },

  [actions.types.clearReplyMessage]: state => {
    state.reply_message_id = null;
  },

  [actions.types.addForwardMessage]: (state, action) => {
    state.forward_message_id = action.payload;
  },

  [actions.types.clearForwardMessage]: state => {
    state.forward_message_id = null;
  },

  [actions.types.clearMessages]: state => {
    state.chatIds = {},
    state.list = {};
    state.edit_message_id = null;
    state.forward_message_id = null;
    state.reply_message_id = null;
  },
});
