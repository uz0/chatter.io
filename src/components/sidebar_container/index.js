import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import classnames from 'classnames/bind';
import SubscriptionItem from '@/components/subscription-item';
import Button from '@/components/button';
import Icon from '@/components/icon';
import { api } from '@';
import { actions as subscriptionsActions } from '@/store/subscriptions';
import style from './style.css';

const cx = classnames.bind(style);

class Sidebar extends Component {
  state = {
    navigationActive: 'all',
  };

  chooseTabNavigation = tab => () => this.setState({ navigationActive: tab });

  async componentWillMount() {
    const shortSubscriptions = await api.getSubscriptions({ short: true });
    this.props.loadSubscriptionsIds(shortSubscriptions.subscriptions);
  }

  render() {
    return <div className={cx('sidebar', this.props.className)}>
      <div className={style.header}>
        <h1>Unichat</h1>
        <div className={style.image} style={{ '--bg-image': 'url(/assets/default-user.jpg)' }} />
        <Button appearance="_fab-divider" icon="add-chat" className={style.button} />
      </div>

      <div className={style.search}>
        <div className={style.search_container}>
          <Icon name="search" />
          <input type="text" placeholder={this.props.t('search')} />
        </div>
      </div>

      <div className={style.navigation}>
        <button
          className={cx({'_is-active': this.state.navigationActive === 'all'})}
          onClick={this.chooseTabNavigation('all')}
        >All</button>

        <button
          className={cx({'_is-active': this.state.navigationActive === 'personal'})}
          onClick={this.chooseTabNavigation('personal')}
        >Personal</button>

        <button
          className={cx({'_is-active': this.state.navigationActive === 'work'})}
          onClick={this.chooseTabNavigation('work')}
        >Work</button>
      </div>

      <div className={style.list}>
        {this.props.subscriptions_ids &&
          this.props.subscriptions_ids.map(id => <SubscriptionItem
            key={id}
            id={id}
            className={style.subscription}
          />)}

        {!this.props.subscriptions_ids &&
          <p className={style.empty}>There is no chats</p>}
      </div>
    </div>;
  }
}

export default compose(
  withNamespaces('translation'),

  connect(
    state => ({
      subscriptions_ids: state.subscriptions.ids,
      subscriptions_list: state.subscriptions.list,
    }),

    {
      loadSubscriptionsIds: subscriptionsActions.loadSubscriptionsIds,
    },
  ),
)(Sidebar);