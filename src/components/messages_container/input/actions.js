import { api } from '@';
import uniq from 'lodash/uniq';
import find from 'lodash/find';
import { actions as messagesActions } from '@/store/messages';
import { actions as notificationActions } from '@/components/notification';
import { actions as modalActions } from '@/components/modal_container';
import { actionsCreator, uid, parseMentions } from '@/helpers';

const actions = actionsCreator([
  'setText',
  'setAttachments',
  'reset',
]);

const tagreg = /\B\#\w\w+\b/gim;

const deleteMessages = () => (dispatch, getState) => {
  const state = getState();

  if (state.messages.checked_ids.length === 0) {
    return;
  }

  state.messages.checked_ids.forEach(id => {
    api.deleteMessage({ message_id: id });
  });

  dispatch(messagesActions.resetCheckedMessages());
};

const forward = ({ subscription_id, callback, isMultiply = false }) => async (dispatch, getState) => {
  const state = getState();

  let ids;

  if (isMultiply) {
    ids = state.messages.checked_ids;
  } else {
    ids = [state.messages.forward_message_id];
  }

  if (!ids || ids.length === 0) {
    return;
  }

  ids = [...ids].sort((prev, next) => next - prev);

  for (let i = 0; i < ids.length; i++) {
    const { message } = await api.post({
      uid: uid(),
      subscription_id,
      text: '',
      forwarded_message_id: ids[i],
    });

    if (i === ids.length - 1) {
      await api.updateSubscription({
        subscription_id,
        last_read_message_id: message.id,
        draft: '',
      });
    }
  }

  if (isMultiply) {
    dispatch(messagesActions.resetCheckedMessages());
  } else {
    dispatch(messagesActions.clearForwardMessage());
  }

  if (callback) {
    callback();
  }
};

const updateDraft = params => (dispatch, getState) => {
  const state = getState();
  const subscription = state.subscriptions.list[params.id];
  api.updateSubscription({subscription_id: subscription.id, draft: params.value});
};

const updateMessage = ({ edit_message_id }) => (dispatch, getState) => {
  const state = getState();
  const updatingMessage = state.messages.list[edit_message_id];

  const { value, upload_id } = state.input;

  const isTextEqual = value === updatingMessage.text;
  // refactore
  const isAttachmentsEqual = false;

  if (isTextEqual && isAttachmentsEqual) {
    return;
  }

  dispatch(actions.reset());
  dispatch(messagesActions.clearEditMessage());

  api.editMessage({
    message_id: edit_message_id,
    text: value,
    upload_id,
  }).catch(error => {
    console.error(error);

    dispatch(notificationActions.showNotification({
      type: 'error',
      text: error.text,
    }));
  });
};

const sendMessage = ({ subscription_id, isForceToFeed }) => (dispatch, getState) => {
  const state = getState();

  if (state.messages.edit_message_id) {
    dispatch(updateMessage({ edit_message_id: state.messages.edit_message_id }));
    return;
  }

  const subscription = state.subscriptions.list[subscription_id];

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

  const { value, attachments, upload_id } = state.input;
  const { reply_message_id } = state.messages;

  const mentions = parseMentions(value, { ids: state.users.ids, list: state.users.list });

  if (value) {
    message.text = value;
  }

  if (attachments) {
    message.attachments = attachments;
  }

  if (upload_id) {
    message.upload_id = upload_id;
  }

  if (reply_message_id) {
    message.in_reply_to_message_id = reply_message_id;
  }

  if (mentions) {
    message.mentions = mentions;
  }

  if (!value && !attachments && !upload_id) {
    dispatch(notificationActions.showNotification({
      type: 'error',
      text: 'No data to send',
    }));

    return;
  }

  dispatch(messagesActions.addMessage({ chatId: subscription.id, message }));

  const tags = value && value.match(tagreg);

  if (tags && !reply_message_id && !isForceToFeed) {
    uniq(tags).forEach((tag, index) => {
      const tagname = tag.substr(1);
      const taggedSubscription = find(state.subscriptions.list, chat => chat.group.is_space && chat.group.name === tagname);

      if (!taggedSubscription) {
        return;
      }

      dispatch(modalActions.toggleModal({
        id: `crosspost-modal-${index}`,

        options: {
          subscription_id: taggedSubscription.id,
          tag: tagname,
        },
      }));
    });
  } else {
    dispatch(actions.reset());
  }

  if (message.in_reply_to_message_id) {
    dispatch(messagesActions.clearReplyMessage());
  }

  const messagesScrollElement = document.querySelector('#messages-scroll');

  if (messagesScrollElement) {
    setTimeout(() => messagesScrollElement.scrollTo(0, messagesScrollElement.scrollHeight));
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

export default {
  ...actions,
  updateDraft,
  sendMessage,
  updateMessage,
  resendMessage,
  deleteMessages,
  forward,
};
