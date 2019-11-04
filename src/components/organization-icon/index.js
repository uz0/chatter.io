import React from 'react';
import get from 'lodash/get';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

const OrganizationIcon = ({
  icon,
  color,
  name,
  organization_icon,
  organization_color,
  organization_name,
  className,
}) => {
  const orgicon = icon || organization_icon;
  const orgcolor = color || organization_color || 'none';
  const orgname = name || organization_name;

  let inline = {};

  if (orgicon && typeof orgicon === 'string') {
    inline['background'] = `center / cover no-repeat url(${orgicon})`;
  }

  if (orgicon && typeof orgicon !== 'string') {
    inline['background'] = `center / cover no-repeat url(${get(orgicon, 'small', '')})`;
  }

  const iconText = orgname ? orgname[0].toUpperCase() : 'C';

  return <div
    className={cx('icon', className)}
    style={inline}
    data-color={orgcolor}
  >
    <span className={style.text}>{iconText}</span>
  </div>;
};

export default compose(
  connect(
    (state, props) => ({
      organization_icon: get(state.organizations.list, `${props.id}.icon`),
      organization_color: get(state.organizations.list, `${props.id}.brand_color`),
      organization_name: get(state.organizations.list, `${props.id}.name`),
    }),
  ),
)(OrganizationIcon);
