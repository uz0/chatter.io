import { actionsCreator } from '@/helpers';

export default actionsCreator([
  'loadMessages',
  'addMessage',
  'updateMessage',
  'clearMessages',

  'addEditMessage',
  'clearEditMessage',

  'addReplyMessage',
  'clearReplyMessage',
]);
