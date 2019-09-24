import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import Link from '@/components/link';
import Icon from '@/components/icon';
import OrganizationIcon from '@/components/organization-icon';
import { api } from '@';
import { actions as organizationsActions } from '@/store/organizations';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

class SidebarPanel extends Component {
  async componentWillMount() {
    if (!this.props.isLoaded) {
      const { organizations } = await api.getOrganizations();
      this.props.loadOrganizations(organizations);
    }
  }

  render() {
    const isOrganizationsExist = this.props.ids.length > 0;

    return <div className={cx('panel', this.props.className)}>
      <Link to="/chat" className={style.button} />
      <div className={style.divider} />

      {isOrganizationsExist &&
        this.props.ids.map(id => {
          const org = this.props.list[id];

          return <OrganizationIcon key={org.id} id={org.id} link={`/${org.id}/chat`} className={style.company} />;
        })
      }

      <Link to="/new-company" className={style.new}>
        <Icon name="plus" />
      </Link>
    </div>;
  }
}

export default compose(
  connect(
    state => ({
      ids: state.organizations.ids,
      list: state.organizations.list,
      isLoaded: state.organizations.isLoaded,
    }),

    {
      loadOrganizations: organizationsActions.loadOrganizations,
    },
  ),
)(SidebarPanel);
