import React from 'react';
import { Link, withRouter } from 'react-router';

const CustomLink = ({
  query,
  to,
  children,
  location,
  ...props
}) => {
  let search = '';

  if (query) {
    search = '?' + Object.keys(query).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`).join('&');
  }

  if (!query && location) {
    search = location.search;
  }

  return <Link
    {...props}
    to={`${to}${search}`}
  >{children}</Link>;
};

export default withRouter(CustomLink);
