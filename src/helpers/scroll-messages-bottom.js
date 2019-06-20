export default async (action, time) => {
  const messagesListRef = document.getElementById('messages-scroll');

  if (!messagesListRef) {
    return;
  }

  const isMessagesListScrolledBottom = messagesListRef.offsetHeight + messagesListRef.scrollTop === messagesListRef.scrollHeight;
  const wait = time => new Promise(resolve => setTimeout(() => resolve(), time));
  action();

  if (time) {
    await wait(time);
  }

  if (isMessagesListScrolledBottom) {
    messagesListRef.scrollTo(0, messagesListRef.scrollHeight);
  }
};
