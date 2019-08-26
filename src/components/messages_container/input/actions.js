import { uid } from '@/helpers';
import { api } from '@';
import uniq from 'lodash/uniq';
import find from 'lodash/find';
import { actions as messagesActions } from '@/store/messages';
import { actions as notificationActions } from '@/components/notification';
import { actions as modalActions } from '@/components/modal_container';

const tagreg = /\B\#\w\w+\b/gim;

const updateDraft = params => (dispatch, getState) => {
  const state = getState();
  const subscription = state.subscriptions.list[params.id];
  api.updateSubscription({subscription_id: subscription.id, draft: params.value});
};

const sendMessage = (params, isForceToSpace = false) => (dispatch, getState) => {
  const state = getState();
  const subscription = state.subscriptions.list[params.subscription_id];

  let message = {
    created_at: new Date().toISOString(),
    deleted_at: null,
    edited_at: null,
    group_id: subscription.group_id,
    uid: uid(),
    reference: {type: null, id: null},
    user_id: state.currentUser.id,
    xtag: null,
  };

  if (params.text) {
    message.text = params.text;
  }

  if (params.attachments) {
    message.attachments = params.attachments;
  }

  if (params.upload_id) {
    message.upload_id = params.upload_id;
  }

  if (params.mentions) {
    message.mentions = params.mentions;
  }

  if (params.reply_message_id) {
    message.in_reply_to_message_id = params.reply_message_id;
  }

  dispatch(messagesActions.addMessage({ chatId: subscription.id, message }));
  const messagesScrollElement = document.querySelector('#messages-scroll');

  if (messagesScrollElement) {
    setTimeout(() => messagesScrollElement.scrollTo(0, messagesScrollElement.scrollHeight));
  }

  const tags = params.text.match(tagreg);

  if (tags && !params.reply_message_id && !isForceToSpace) {
    uniq(tags).forEach((tag, index) => {
      const tagname = tag.substr(1);
      const subscription = find(state.subscriptions.list, chat => chat.group.is_space && chat.group.name === tagname);

      if (!subscription) {
        return;
      }

      dispatch(modalActions.toggleModal({
        id: `crosspost-modal-${index}`,

        options: {
          message: params,
          subscription_id: subscription.id,
          tag: tagname,
        },
      }));
    });
  }

  api.post({
    uid: message.uid,
    subscription_id: subscription.id,
    text: message.text || ' ',
    ...message.upload_id ? {upload_id: message.upload_id} : {},
    ...message.mentions ? {mentions: message.mentions} : {},
    ...message.in_reply_to_message_id ? { in_reply_to_message_id: message.in_reply_to_message_id } : {},
  }).then(data => {
    api.updateSubscription({
      subscription_id: subscription.id,
      last_read_message_id: data.message.id,
      draft: '',
    });
  }).catch(error => {
    console.error(error);

    dispatch(notificationActions.showNotification({
      type: 'error',
      text: error.text,
    }));

    dispatch(
      messagesActions.updateMessage({chatId: subscription.id, message: {
        ...message,
        isError: true,
      }}),
    );
  });
};

const updateMessage = params => (dispatch, getState) => {
  const state = getState();
  const updatingMessage = state.messages.list[state.messages.edit_message_id];

  const isTextEqual = params.text === updatingMessage.text;
  // refactore
  const isAttachmentsEqual = false;

  if (isTextEqual && isAttachmentsEqual) {
    return;
  }

  api.editMessage({
    message_id: params.edit_message_id,
    text: params.text,
    upload_id: params.upload_id,
  }).catch(error => {
    console.error(error);

    dispatch(notificationActions.showNotification({
      type: 'error',
      text: error.text,
    }));
  });
};

const resendMessage = params => (dispatch, getState) => {
  const state = getState();
  const message = state.messages.list[params.uid];

  dispatch(
    messagesActions.updateMessage({chatId: params.subscription_id, message: {
      ...message,
      isError: false,
    }}),
  );

  api.post({
    uid: params.uid,
    subscription_id: params.subscription_id,
    text: message.text || ' ',
    ...message.upload_id ? {upload_id: message.upload_id} : {},
    ...message.mentions ? {mentions: message.mentions} : {},
    ...message.in_reply_to_message_id ? { in_reply_to_message_id: message.in_reply_to_message_id } : {},
  }).then(data => {
    api.updateSubscription({
      subscription_id: params.subscription_id,
      last_read_message_id: data.message.id,
      draft: '',
    });
  }).catch(error => {
    dispatch(notificationActions.showNotification({
      type: 'error',
      text: error.text,
    }));

    dispatch(
      messagesActions.updateMessage({chatId: params.subscription_id, message: {
        ...message,
        isError: true,
      }}),
    );
  });
};

export default { updateDraft, sendMessage, updateMessage, resendMessage };