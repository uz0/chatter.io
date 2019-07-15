import actions from './actions';
import { createReducer } from 'redux-starter-kit';
import mobileDetect from 'mobile-detect';

const md = new mobileDetect(window.navigator.userAgent);
const isMobile = !!md.mobile();

const initialState = {
  ids: [],
  list: {},
};

if (!isMobile) {
  initialState.ids = ['panel-container'];
}

export default createReducer(initialState, {
  [actions.types.toggleModal]: (state, action) => {
    const index = state.ids.indexOf(action.payload.id);

    if (index === -1) {
      state.ids.push(action.payload.id);

      if (action.payload.options) {
        state.list[action.payload.id] = action.payload.options;
      }
    } else {
      delete state.ids[index];

      if (state.list[action.payload.id]) {
        delete state.list[action.payload.id];
      }
    }
  },

  [actions.types.closeModal]: (state, action) => {
    const index = state.ids.indexOf(action.payload);

    if (index !== -1) {
      delete state.ids[index];
    }

    if (state.list[action.payload]) {
      delete state.list[action.payload];
    }
  },
});
