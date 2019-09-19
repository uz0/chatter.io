import map from 'lodash/map';
import { actionsCreator } from '@/helpers';
import { actions as usersActions } from '@/store/users';

let actions = actionsCreator([
  'loadOrganizations',
  'addOrganization',
  'updateOrganization',
  'removeOrganization',

  'loadOrganizationUsers',
  'addOrganizationUser',
  'updateOrganizationUser',
  'deleteOrganizationUser',
]);

const diff = actions.loadOrganizationUsers;

actions.loadOrganizationUsers = organizationUsers => dispatch => {
  const users = map(organizationUsers, 'user');
  dispatch(usersActions.addUsers(users));
  dispatch(diff(organizationUsers));
};

export default actions;
