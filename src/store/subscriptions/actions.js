import isEmpty from 'lodash/isEmpty';
import { api } from '@';
import { actionsCreator } from '@/helpers';
import { actions as messagesActions } from '@/store/messages';
import { actions as notificationActions } from '@/components/notification';
import config from '@/config';

const actions = actionsCreator([
  'loadSubscriptions',
  'clearSubscriptions',
  'addSubscription',
  'addArraySubscriptions',
  'updateSubscription',
  'setHoverSubscription',
  'search',
  'toggleSearchMessages',
  'removeSubscription',
]);

const isAllChatsLoaded = chatIds => {
  let hasNotLoaded = false;

  Object.keys(chatIds).forEach(id => {
    const chat = chatIds[id];

    if (!chat.isLoaded || !!chat.hasMore) {
      hasNotLoaded = true;
    }
  });

  return !hasNotLoaded;
};

const loadingOneChat = (chatId) => async (dispatch, getState) => {
  const initialState = getState();
  const chatIds = initialState.messages.chatIds[chatId];

  if (!chatIds.isLoaded) {
    const response = await api.getMessages({ subscription_id: chatId, limit: config.items_per_page });
    const stateAfterGetMessages = getState();

    if (stateAfterGetMessages.subscriptions.is_searching_old_messages) {
      dispatch(messagesActions.loadMessages({chatId, list: response.messages, isLoaded: true}));
    }
  } else {
    const response = await api.getMessages({ subscription_id: chatId, limit: config.items_per_page, offset: chatIds.list.length });
    const stateAfterGetMessages = getState();

    if (stateAfterGetMessages.subscriptions.is_searching_old_messages) {
      dispatch(messagesActions.loadMoreMessages({chatId, list: response.messages}));
    }
  }

  const stateAfterLoad = getState();

  if (stateAfterLoad.subscriptions.is_searching_old_messages) {
    dispatch(actions.search({
      text: stateAfterLoad.subscriptions.filter_text,
      tag: stateAfterLoad.subscriptions.filter_tag,
      global_users: stateAfterLoad.subscriptions.filtered_global_users,
      messages: stateAfterLoad.messages,
    }));
  }

  if (
    stateAfterLoad.subscriptions.filter_text.length >= 4 &&
    stateAfterLoad.subscriptions.is_searching_old_messages &&
    stateAfterLoad.messages.chatIds[chatId].hasMore
  ) {
    dispatch(loadingOneChat(chatId));
  }

  if (isAllChatsLoaded(stateAfterLoad.messages.chatIds)) {
    dispatch(actions.toggleSearchMessages(false));
  }
};

const loadingOldMessages = () => async (dispatch, getState) => {
  const state = getState();
  dispatch(actions.toggleSearchMessages(true));
  state.subscriptions.ids.forEach(id => dispatch(loadingOneChat(id)));
};

const filterSubscription = params => (dispatch, getState) => {
  const state = getState();

  dispatch(actions.search({
    ...params,
    messages: state.messages,
  }));

  const stateAfterSearch = getState();

  if (params.text && params.text.length >= 4 && isEmpty(stateAfterSearch.subscriptions.filtered_messages) && !stateAfterSearch.subscriptions.is_searching_old_messages) {
    dispatch(loadingOldMessages());
  }

  const isAllLoaded = isAllChatsLoaded(stateAfterSearch.messages.chatIds);
  const isSearchTextDeleted = params.text && params.text.length < 4 && state.subscriptions.is_searching_old_messages;

  if (isSearchTextDeleted || isAllLoaded) {
    dispatch(actions.toggleSearchMessages(false));
  }

  if (params.text && params.text.length >= 4 && !/\s/.test(params.text)) {
    api.searchUser({ nick_prefix: params.text }).then(data => {
      const stateNow = getState();

      dispatch(actions.search({
        ...params,
        messages: stateNow.messages,
        global_users: data.users,
      }));
    }).catch(error => {
      console.error(error);

      if (error.text) {
        dispatch(notificationActions.showNotification(error.text));
      }
    });
  }
};

export default {
  ...actions,
  filterSubscription,
};