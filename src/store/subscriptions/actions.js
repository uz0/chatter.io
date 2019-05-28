import { api } from '@';
import { actionsCreator } from '@/helpers';
import { actions as notificationActions } from '@/components/notification';

const actions = actionsCreator([
  'loadSubscriptionsIds',
  'clearSubscriptions',
  'loadSubscription',
  'addSubscription',
  'updateSubscription',
  'setHoverSubscription',
  'search',
  'removeSubscription',
]);

const filterSubscription = params => (dispatch, getState) => {
  const state = getState();

  dispatch(actions.search({
    ...params,
    messages: state.messages,
  }));

  if (params.text && params.text.length >= 4) {
    api.searchUser({ nick_prefix: params.text }).then(data => {
      dispatch(actions.search({
        ...params,
        messages: state.messages,
        global_users: data.users,
      }));
    }).catch(error => {
      console.error(error);

      if (error.text) {
        dispatch(notificationActions.showNotification(error.text));
      }
    });
  }
};

export default {
  ...actions,
  filterSubscription,
};