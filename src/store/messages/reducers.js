import actions from './actions';

const initialState = {
  chatIds: {},
  list: {},
  edit_message_id: null,
  reply_message_id: null,
};

export default (state = initialState, action) => {
  if (action.type === actions.types.loadMessages) {
    const chatId = action.payload.chatId;
    const isLoaded = action.payload.isLoaded || false;
    const list = action.payload.list;

    let stateChatIds = { ...state.chatIds };
    let stateList = { ...state.list };

    stateChatIds[chatId] = {
      isLoaded,
      list: [],
    };

    list.forEach(message => {
      stateList[message.id] = message;
      stateChatIds[chatId].list.push(message.id);
    });

    return {
      ...state,
      chatIds: stateChatIds,
      list: stateList,
    };
  }

  if (action.type === actions.types.addMessage) {
    const chatId = action.payload.chatId;
    const message = action.payload.message;

    let stateChatIds = { ...state.chatIds };
    let stateList = { ...state.list };

    if (chatId) {
      stateChatIds[chatId].list = [(message.uid || message.id), ...stateChatIds[chatId].list];
    }

    stateList[message.uid || message.id] = message;

    return {
      ...state,
      chatIds: stateChatIds,
      list: stateList,
    };
  }

  if (action.type === actions.types.updateMessage) {
    const chatId = action.payload.chatId;
    const message = action.payload.message;

    let stateChatIds = { ...state.chatIds };
    let stateList = { ...state.list };

    if (message.uid && message.id) {
      const uidMessageIndex = stateChatIds[chatId].list.indexOf(message.uid);
      stateChatIds[chatId].list[uidMessageIndex] = message.id;
      stateList[message.id] = [message.uid];
      delete stateList[message.uid];
    }

    stateList[message.id] = {
      ...stateList[message.id],
      ...message,
    };

    return {
      ...state,
      chatIds: stateChatIds,
      list: stateList,
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
