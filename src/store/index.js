import { createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import reducers from './reducers';

export { default as actions } from './actions';
export { default as reducers } from './reducers';

const logger = createLogger({
  collapsed: true,
});

const store = createStore(reducers, {}, applyMiddleware(logger));

export default store;
