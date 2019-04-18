import { actionsCreator } from '@/helpers';

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
};

export default {
  ...actions,
  filterSubscription,
};