import isEqual from 'lodash/isEqual';
import { uid } from '@/helpers';
import { api } from '@';
import { actions as messagesActions } from '@/store/messages';
import { actions as notificationActions } from '@/components/notification';

const updateDraft = params => (dispatch, getState) => {
  const state = getState();
  const subscription = state.subscriptions.list[params.id];
  api.updateSubscription({subscription_id: subscription.id, draft: params.value});
};

const sendMessage = params => (dispatch, getState) => {
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

  if (params.attachment) {
    message.attachment = params.attachment;
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

  setTimeout(() => {
    const messagesScrollElement = document.getElementById('messages-scroll');

    if (messagesScrollElement) {
      messagesScrollElement.scrollTo(0, messagesScrollElement.scrollHeight);
    }
  });

  api.post({
    uid: message.uid,
    subscription_id: subscription.id,
    text: message.text || ' ',
    ...message.attachment && !message.upload_id ? {attachment: message.attachment.url} : {},
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
    dispatch(notificationActions.showNotification(error.text));

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
  const isAttachmentsEqual = isEqual(params.attachment, updatingMessage.attachment);

  if (isTextEqual && isAttachmentsEqual) {
    return;
  }

  api.editMessage({
    message_id: params.edit_message_id,
    text: params.text,
    ...params.attachment && !params.upload_id ? {attachment: params.attachment.url} : {},
    ...params.upload_id ? {upload_id: params.upload_id} : {},
  }).catch(error => {
    console.error(error);
    dispatch(notificationActions.showNotification(error.text));
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
    ...message.attachment ? {attachment: message.attachment.url} : {},
    ...message.mentions ? {mentions: message.mentions} : {},
    ...message.in_reply_to_message_id ? { in_reply_to_message_id: message.in_reply_to_message_id } : {},
  }).then(data => {
    api.updateSubscription({
      subscription_id: params.subscription_id,
      last_read_message_id: data.message.id,
      draft: '',
    });
  }).catch(error => {
    dispatch(notificationActions.showNotification(error.text));

    dispatch(
      messagesActions.updateMessage({chatId: params.subscription_id, message: {
        ...message,
        isError: true,
      }}),
    );
  });
};

export default { updateDraft, sendMessage, updateMessage, resendMessage };