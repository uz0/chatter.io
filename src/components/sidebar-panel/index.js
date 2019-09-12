import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import Link from '@/components/link';
import Icon from '@/components/icon';
import { actions as organizationsActions } from '@/store/organizations';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

const getOrganizations = () => new Promise(resolve => {
  setTimeout(() => {
    resolve({
      organizations: [
        {
          id: 1,
          name: 'New Org',
        },

        {
          id: 2,
          name: 'Blabla',
        },

        {
          id: 3,
          name: 'Hello World',
        },
      ],
    });
  }, 2000);
});

const api = {
  getOrganizations,
};

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

          return <Link key={org.id} to={`/${org.id}/chat`} className={style.button}>
            <img src="/assets/default-image.jpg" />
          </Link>;
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
