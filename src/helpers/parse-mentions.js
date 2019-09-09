import find from 'lodash/find';

export default (text, { ids, list }) => {
  if (!text) {
    return null;
  }

  let mentions = [];
  const pattern = /\B([@][\w._-]+)/gi;
  const allMentions = text.match(pattern);

  ids.forEach(id => {
    const user = list[id];

    if (!user.nick) {
      return;
    }

    const isUserExistInMentions = find(allMentions, mention => `${mention.toLowerCase()}` === `@${user.nick.toLowerCase()}`);

    if (isUserExistInMentions) {
      mentions.push({ user_id: user.id, text: user.nick });
    }
  });

  return mentions || null;
};
