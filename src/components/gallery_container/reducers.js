import actions from './actions';
import { createReducer } from 'redux-starter-kit';

const initialState = {
  images: [],
  index: 0,
};

export default createReducer(initialState, {
  [actions.types.open]: (state, action) => {
    state.images = action.payload.images;

    if (action.payload.index) {
      state.index = action.payload.index;
    }
  },

  [actions.types.step]: (state, action) => {
    state.index = action.payload;
  },

  [actions.types.close]: state => {
    state.images = [];
    state.index = 0;
  },
});
