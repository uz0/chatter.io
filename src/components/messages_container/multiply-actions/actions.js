import { api } from '@';
import { actions as messagesActions } from '@/store/messages';

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

export default { deleteMessages };
