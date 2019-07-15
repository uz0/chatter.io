import React from 'react';
import omit from 'lodash/omit';
import { withRouter } from 'react-router';
import { NavLink } from 'react-router-dom';

const CustomLink = ({
  query,
  to,
  children,
  location,
  ...props
}) => {
  const lintProps = omit(props, 'staticContext');
  let search = '';

  if (query) {
    search = '?' + Object.keys(query).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`).join('&');
  }

  if (!query) {
    search = location.search;
  }

  return <NavLink
    {...lintProps}
    to={`${to}${search}`}
  >{children}</NavLink>;
};

export default withRouter(CustomLink);
