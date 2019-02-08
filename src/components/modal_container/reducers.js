import actions from './actions';

const initialState = ['panel-container'];

export default (state = initialState, action) => {
  if (action.type === actions.types.toggleModal) {
    let stateArray = [ ...state ];
    const index = stateArray.indexOf(action.payload);

    if (index === -1) {
      stateArray.push(action.payload);
    } else {
      delete stateArray[index];
    }

    return stateArray;
  }

  if (action.type === actions.types.closeModal) {
    let stateArray = [ ...state ];
    const index = stateArray.indexOf(action.payload);

    if (index !== -1) {
      delete stateArray[index];
    }

    return stateArray;
  }

  return state;
};
