import reject from 'lodash/reject';

export default chat => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const contact = reject(chat.group.participants, { user_id: currentUser.id })[0];

  if (contact) {
    return contact.user;
  }

  return null;
};
