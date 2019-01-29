import actions from './actions';

const initialState = {
  isShown: false,
  text: '',
};

export default (state = initialState, action) => {
  if (action.type === actions.types.showNotification) {
    return {
      isShown: true,
      text: action.text,
    };
  }

  if (action.type === actions.types.hideNotification) {
    return {
      isShown: false,
      text: '',
    };
  }

  return state;
};
