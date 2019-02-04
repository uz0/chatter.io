import groupBy from 'lodash/groupBy';
import map from 'lodash/map';
import moment from 'moment';

export default (state, props) => {
  if (!props.details) {
    return null;
  }

  const chatIds = state.messages.chatIds[props.details.id];

  if (!chatIds || !chatIds.isLoaded) {
    return null;
  }

  const groupedByDate = groupBy(
    map(chatIds.list, id => state.messages.list[id]),
    message => moment(message.created_at).format('YYYY-MM-DD'),
  );

  let array = [];
  const dates = Object.keys(groupedByDate).sort();

  dates.forEach(key => {
    array.push({ type: 'dateDelimiter', date: key });

    let messages = [];

    groupedByDate[key].reverse().forEach(message => {
      if (message.xtag) {
        if (messages.length > 0) {
          array.push({ type: 'messages', messages_ids: messages });
        }

        array.push({ type: 'xtagDelimiter', message_id: message.id });
        messages = [];
        return;
      }

      messages.push(message.id);
    });

    if (messages.length > 0) {
      array.push({ type: 'messages', messages_ids: messages });
    }
  });

  return array;
};