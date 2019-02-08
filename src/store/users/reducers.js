import actions from './actions';

const initialState = {
  ids: [],
  list: {},
};

export default (state = initialState, action) => {
  if (action.type === actions.types.addUser) {
    let ids = state.ids;
    let list = state.list;

    const user = action.payload;

    if (list[user.id]) {
      return;
    }

    list[user.id] = user;
    ids.push(user.id);

    return {
      ids,
      list,
    };
  }

  if (action.type === actions.types.addUsers) {
    let ids = state.ids;
    let list = state.list;

    action.payload.forEach(participant => {
      const user = participant.user;

      if (list[user.id]) {
        return;
      }

      list[user.id] = user;
      ids.push(user.id);
    });

    return {
      ids,
      list,
    };
  }

  if (action.type === actions.types.updateUser) {
    let list = state.list;

    list[action.payload.id] = {
      ...list[action.payload.id],
      ...action.payload,
    };

    return {
      ...state,
      list,
    };
  }

  if (action.type === actions.types.clearUsers) {
    return {
      ids: [],
      list: {},
    };
  }

  return state;
};
