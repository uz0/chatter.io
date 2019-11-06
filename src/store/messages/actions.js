import { actionsCreator } from '@/helpers';
import inputActions from '@/components/messages_container/input/actions';

let actions = actionsCreator([
  'loadMessages',
  'loadMoreMessages',
  'addMessage',
  'updateMessage',
  'clearMessages',

  'addEditMessage',
  'clearEditMessage',

  'addReplyMessage',
  'clearReplyMessage',

  'addForwardMessage',
  'clearForwardMessage',

  'toggleCheckMessage',
  'resetCheckedMessages',
]);

const wrapSetValue = func => id => (dispatch, getState) => {
  const state = getState();
  const message = state.messages.list[id];

  if (message.text.replace(/<(?:.|\n)*?>/gm, '')) {
    dispatch(inputActions.setText(message.text));
  }

  dispatch(func(id));
};

actions.addEditMessage = wrapSetValue(actions.addEditMessage);

export default actions;
