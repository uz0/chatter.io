export default action => {
  const messagesListRef = document.getElementById('messages-scroll');

  if (!messagesListRef) {
    return;
  }

  const isMessagesListScrolledBottom = messagesListRef.offsetHeight + messagesListRef.scrollTop === messagesListRef.scrollHeight;

  if (action) {
    action();
  }

  if (isMessagesListScrolledBottom) {
    setTimeout(() => messagesListRef.scrollTo(0, messagesListRef.scrollHeight));
  }
};
