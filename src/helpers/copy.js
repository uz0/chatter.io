export default (value, callback) => {
  let element = document.createElement('textarea');
  element.value = value;
  element.setAttribute('readonly', '');
  element.style = {position: 'absolute', left: '-9999px'};
  document.body.appendChild(element);

  if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
    const editable = element.contentEditable;
    const readOnly = element.readOnly;

    element.contentEditable = true;
    element.readOnly = true;

    let range = document.createRange();
    range.selectNodeContents(element);

    let selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    element.setSelectionRange(0, 999999);

    element.contentEditable = editable;
    element.readOnly = readOnly;
  } else {
    element.select();
  }

  document.execCommand('copy');
  document.body.removeChild(element);
  callback();
};
