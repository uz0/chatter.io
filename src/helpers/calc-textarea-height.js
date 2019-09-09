import scrollMessagesBottom from './scroll-messages-bottom';

export default () => {
  const textarea = document.querySelector('#textarea');

  if (!textarea) {
    return;
  }

  scrollMessagesBottom(() => {
    textarea.style.height = '20px';
    textarea.style.height = `${textarea.scrollHeight}px`;
  });
};