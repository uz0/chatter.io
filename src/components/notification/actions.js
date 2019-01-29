const types = {
  showNotification: 'showNotification',
  hideNotification: 'hideNotification',
};

const showNotification = text => ({
  type: types.showNotification,
  text,
});

const hideNotification = () => ({
  type: types.hideNotification,
});

export default {showNotification, hideNotification, types};
