import { actionsCreator } from '@/helpers';

export default actionsCreator([
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
]);
