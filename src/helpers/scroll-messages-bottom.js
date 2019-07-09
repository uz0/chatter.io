export default async (action, time) => {
  const messagesListRef = document.getElementById('messages-scroll');

  if (!messagesListRef) {
    return;
  }

  const isMessagesListScrolledBottom = messagesListRef.offsetHeight + messagesListRef.scrollTop + 50 >= messagesListRef.scrollHeight;
  const wait = time => new Promise(resolve => setTimeout(() => resolve(), time));

  if (action) {
    action();
  }

  if (time) {
    await wait(time);
  }

  if (isMessagesListScrolledBottom) {
    messagesListRef.scrollTo(0, messagesListRef.scrollHeight);
  }
};
