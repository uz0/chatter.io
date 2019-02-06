import actions from './actions';

const initialState = [];

export default (state = initialState, action) => {
  if (action.type === actions.types.showModal) {
    let stateArray = [ ...state ];
    stateArray.push(action.payload);
    return stateArray;
  }

  if (action.type === actions.types.closeModal) {
    let stateArray = [ ...state ];
    const index = stateArray.indexOf(action.payload);
    delete stateArray[index];
    return stateArray;
  }

  return state;
};
