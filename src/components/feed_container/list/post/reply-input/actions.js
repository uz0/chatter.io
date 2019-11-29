import { api } from '@';
import { actions as messagesActions } from '@/store/messages';
import { actions as notificationActions } from '@/components/notification';
import { uid } from '@/helpers';

const sendComment = ({ subscription_id, text, reply_message_id }) => async (dispatch, getState) => {
  const state = getState();
  const subscription = state.subscriptions.list[subscription_id];

  if (!subscription) {
    return;
  }

  if (!text || !reply_message_id) {
    dispatch(notificationActions.showNotification({
      text: 'No data to send',
    }));

    return;
  }

  let messageObject = {
    created_at: new Date().toISOString(),
    deleted_at: null,
    edited_at: null,
    group_id: subscription.group_id,
    uid: uid(),
    reference: {type: null, id: null},
    in_reply_to_message_id: reply_message_id,
    user_id: state.currentUser.id,
    text,
    xtag: null,
  };

  dispatch(messagesActions.addMessage({
    chatId: subscription.id,
    message: messageObject,
  }));

  try {
    const { message } = await api.post({
      uid: messageObject.uid,
      subscription_id: subscription.id,
      text: messageObject.text || ' ',
      in_reply_to_message_id: messageObject.in_reply_to_message_id,
    });

    api.updateSubscription({
      subscription_id: subscription.id,
      last_read_message_id: message.id,
    });
  } catch (error) {
    console.error(error);

    dispatch(notificationActions.showNotification({
      text: error.text,
    }));
  }
};

export default {
  sendComment,
};
