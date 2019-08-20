export default value => {
  if (!value) {
    return '';
  }

  let text = value.replace(/\r|\n|\r\n/g, '<br />');

  if (text[0] === ' ') {
    text = text.substring(1);
  }

  if (text[text.length - 1] === ' ') {
    text = text.substring(0, text.length - 1);
  }

  return text;
};
