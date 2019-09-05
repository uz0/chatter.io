export default (event, inputId) => {
  event.persist();
  const items = (event.clipboardData || event.originalEvent.clipboardData).items;
  let list = new DataTransfer();

  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf('image') === 0) {
      list.items.add(items[i].getAsFile());
    }
  }

  if (list.files.length === 0) {
    return;
  }

  const attachInput = document.querySelector(`#${inputId}`);

  if (!attachInput) {
    return;
  }

  attachInput.files = list.files;
};
