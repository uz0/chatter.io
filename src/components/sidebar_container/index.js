import React, { Component } from 'react';
import compose from 'recompose/compose';
import { withNamespaces } from 'react-i18next';
import classnames from 'classnames/bind';
import Subscription from '@/components/subscription';
import Button from '@/components/button';
import Icon from '@/components/icon';
import style from './style.css';

const cx = classnames.bind(style);

class Sidebar extends Component {
  state = {
    navigationActive: 'all',
  };

  chooseTabNavigation = tab => () => this.setState({ navigationActive: tab });

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
        <Subscription className={style.subscription} />
        <Subscription className={style.subscription} />
      </div>
    </div>;
  }
}

export default compose(
  withNamespaces('translation'),
)(Sidebar);
