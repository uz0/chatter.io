import { createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import reducers from './reducers';

export { default as actions } from './actions';
export { default as reducers } from './reducers';

const middlewares = [...thunk];

if (process.env.NODE_ENV === 'development') {
  const logger = createLogger({
    collapsed: true,
  });

  middlewares.push(logger);
}

const store = createStore(reducers, {}, applyMiddleware(...middlewares));

export default store;
