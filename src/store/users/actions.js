import { actions as storeActions } from '@/store';
import { actionsCreator } from '@/helpers';

let actions = actionsCreator([
  'addUser',
  'addUsers',
  'updateUser',
  'clearUsers',
]);

const diff = actions.updateUser;

actions.updateUser = params => (dispatch, getState) => {
  const state = getState();

  if (state.currentUser.id === params.id) {
    dispatch(storeActions.setCurrentUser({
      ...state.currentUser,
      ...params,
    }));
  }

  dispatch(diff(params));
};

export default actions;
