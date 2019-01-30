import React, { Component } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import classnames from 'classnames/bind';
import { withNamespaces } from 'react-i18next';
import Subscription from '@/components/subscription';
import Button from '@/components/button';
import Icon from '@/components/icon';
import style from './style.css';

const cx = classnames.bind(style);

class Chat extends Component {
  state = {
    navigationActive: 'all',
    isPanelShown: false,
  };

  chooseTabNavigation = tab => () => this.setState({ navigationActive: tab });
  openPanel = () => this.setState({ isPanelShown: true });
  closePanel = () => this.setState({ isPanelShown: false });

  componentWillMount() {
    if (!this.props.currentUser) {
      this.props.router.push('/sign-in');
      return;
    }
  }

  render() {
    return <div className={style.chat}>
      <div className={style.sidebar}>
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
      </div>

      <div className={style.content}>
        <div className={style.header}>
          <button onClick={this.openPanel}>Revolution Product</button>
          <p className={style.count}>12 people</p>
        </div>

        <div className={style.messages} />
        <div className={style.input_container} />
      </div>

      <div className={cx('panel', { '_is-shown': this.state.isPanelShown })}>
        <Button appearance="_icon-transparent" icon="arrow-left" onClick={this.closePanel} className={style.close} />
      </div>
    </div>;
  }
}

export default compose(
  withNamespaces('translation'),

  connect(
    state => ({
      currentUser: state.currentUser,
    }),
  ),
)(Chat);
