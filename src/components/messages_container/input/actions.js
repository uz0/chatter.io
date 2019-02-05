import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import { uid } from '@/helpers';
import { api } from '@';
import { actions as messagesActions } from '@/store/messages';

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
    id: uid(),
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

  if (params.mentions) {
    message.mentions = params.mentions;
  }

  if (params.reply_message_id) {
    message.in_reply_to_message_id = params.reply_message_id;
  }

  dispatch(messagesActions.addMessage({ chatId: subscription.id, message }));

  api.post({
    uid: message.id,
    subscription_id: subscription.id,
    ...message.text ? {text: message.text} : {},
    ...message.attachment ? {attachment: message.attachment.url} : {},
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
  });
};

const updateMessage = params => (dispatch, getState) => {
  const state = getState();
  const updatingMessage = state.messages.list[state.messages.edit_message_id]

  const isTextEqual = params.text === updatingMessage.text;
  const isAttachmentsEqual = isEqual(params.attachment, updatingMessage.attachment);

  if (isTextEqual && isAttachmentsEqual) {
    return;
  }

  api.editMessage({
    message_id: params.edit_message_id,
    text: params.text,
    ...params.attachment ? {attachment: params.attachment.url} : {},
  }).catch(error => {
    console.error(error);
  });
}

export default { updateDraft, sendMessage, updateMessage };