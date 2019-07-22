import isEmpty from 'lodash/isEmpty';
import { api } from '@';
import { actionsCreator } from '@/helpers';
import { actions as notificationActions } from '@/components/notification';
import { itemsPerPage } from '@/components/messages_container';

const actions = actionsCreator([
  'loadSubscriptions',
  'clearSubscriptions',
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

  const stateAfterSearch = getState();

  if (isEmpty(stateAfterSearch.subscriptions.filtered_messages)) {
    console.log(itemsPerPage);
  }

  if (params.text && params.text.length >= 4 && !/\s/.test(params.text)) {
    api.searchUser({ nick_prefix: params.text }).then(data => {
      const stateNow = getState();

      dispatch(actions.search({
        ...params,
        messages: stateNow.messages,
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