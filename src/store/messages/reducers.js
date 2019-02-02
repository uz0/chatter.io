import map from 'lodash/map';
import uniq from 'lodash/uniq';
import actions from './actions';

const initialState = {
  chatIds: {},
  list: {},
  edit_message_id: null,
  reply_message_id: null,
};

export default (state = initialState, action) => {
  if (action.type === actions.types.loadMessages) {
    let chatIds = state.chatIds;
    let list = state.list;

    if (chatIds[action.payload.chatId] && chatIds[action.payload.chatId].isLoaded) {
      return state;
    }

    chatIds[action.payload.chatId] = {
      isLoaded: chatIds[action.payload.chatId] ? action.payload.isLoaded || chatIds[action.payload.chatId].isLoaded || false : action.payload.isLoaded || false,

      list: chatIds[action.payload.chatId] ?
        uniq([...chatIds[action.payload.chatId].list, ...map(action.payload.list, 'id')]) :
        map(action.payload.list, 'id'),
    };

    action.payload.list.forEach(message => {
      if (!list[message.id]) {
        list[message.id] = message;
      }
    });

    return {
      ...state,
      chatIds,
      list,
    };
  }

  if (action.type === actions.types.addMessage) {
    let chatIds = state.chatIds;

    if (action.payload.chatId) {
      const currentChatListIds = chatIds[action.payload.chatId] ? chatIds[action.payload.chatId].list : [];

      if (!chatIds[action.payload.chatId]) {
        chatIds[action.payload.chatId] = {
          isLoaded: false,
          list: currentChatListIds,
        };
      }

      if (action.payload.message.uid) {
        chatIds[action.payload.chatId].list = [action.payload.message.uid, ...currentChatListIds];
      }

      if (action.payload.message.id) {
        chatIds[action.payload.chatId].list = [action.payload.message.id, ...currentChatListIds];
      }
    }

    let list = state.list;
    list[action.payload.message.id || action.payload.message.uid] = action.payload.message;

    return {
      ...state,
      chatIds,
      list,
    };
  }

  if (action.type === actions.types.updateMessage) {
    let chatIds = state.chatIds;
    let list = state.list;

    if (action.payload.message.uid && action.payload.message.id) {
      const uidMessageIndex = chatIds[action.payload.chatId].list.indexOf(action.payload.message.uid);
      chatIds[action.payload.chatId].list[uidMessageIndex] = action.payload.message.id;

      list[action.payload.message.id] = {
        ...list[action.payload.message.uid],
        ...action.payload.message,
      };

      delete list[action.payload.message.uid];
    } else {
      list[action.payload.message.id] = {
        ...list[action.payload.message.id],
        ...action.payload.message,
      };
    }

    return {
      ...state,
      chatIds,
      list,
    };
  }

  if (action.type === actions.types.addEditMessage) {
    return {
      ...state,
      edit_message_id: action.payload,
    };
  }

  if (action.type === actions.types.clearEditMessage) {
    return {
      ...state,
      edit_message_id: null,
    };
  }

  if (action.type === actions.types.addReplyMessage) {
    return {
      ...state,
      reply_message_id: action.payload,
    };
  }

  if (action.type === actions.types.clearReplyMessage) {
    return {
      ...state,
      reply_message_id: null,
    };
  }

  if (action.type === actions.types.clearMessages) {
    return {
      chatIds: {},
      list: {},
      edit_message_id: null,
      reply_message_id: null,
    };
  }

  return state;
};
