import actions from './actions';
import { createReducer } from 'redux-starter-kit';

const initialState = {
  value: '',
  upload_id: null,
  attachments: null,
};

export default createReducer(initialState, {
  [actions.types.setText]: (state, action) => {
    state.value = action.payload;
  },

  [actions.types.setAttachments]: (state, action) => {
    state.attachments = action.payload.attachments;
    state.upload_id = action.payload.upload_id;
  },

  [actions.types.reset]: state => {
    state.value = '';
    state.attachments = null;
    state.upload_id = null;
  },
});
