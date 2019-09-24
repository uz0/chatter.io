import React from 'react';
import get from 'lodash/get';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import Link from '@/components/link';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

const Container = ({ children, ...props }) => <div {...props}>{children}</div>;

const OrganizationIcon = ({
  icon,
  color,
  name,
  organization_icon,
  organization_color,
  organization_name,
  link,
  className,
}) => {
  const Wrapper = link ? Link : Container;

  const orgicon = icon || organization_icon;
  const orgcolor = color || organization_color || 'none';
  const orgname = name || organization_name;

  let inline = {};

  if (typeof orgicon === 'string') {
    inline['--image'] = `url(${orgicon})`;
  } else {
    inline['--image'] = `url(${get(orgicon, 'small', '')})`;
  }

  const iconText = orgname ? orgname[0].toUpperCase() : 'C';

  return <Wrapper
    className={cx('icon', className)}
    style={inline}
    data-color={orgcolor}
    {...link ? {to: link} : {}}
  >
    <span className={style.text}>{iconText}</span>
  </Wrapper>;
};

export default compose(
  connect(
    (state, props) => {
      if (!props.id) {
        return {};
      }

      return {
        organization_icon: state.organizations.list[props.id].icon,
        organization_color: state.organizations.list[props.id].brand_color,
        organization_name: state.organizations.list[props.id].brand_name,
      };
    },
  ),
)(OrganizationIcon);
