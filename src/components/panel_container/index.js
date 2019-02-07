import React, { Component, Fragment } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import find from 'lodash/find';
import { withNamespaces } from 'react-i18next';
import classnames from 'classnames/bind';
import SubscriptionAvatar from '@/components/subscription-avatar';
import Button from '@/components/button';
import Dropdown from '@/components/dropdown';
import Icon from '@/components/icon';
import Loading from '@/components/loading';
import { withDetails } from '@/hoc';
import { getChatName } from '@/helpers';
import { actions as modalActions } from '@/components/modal_container';
import style from './style.css';

const cx = classnames.bind(style);

class Panel extends Component {
  state = {
    collapseActive: '',
  };

  closePanel = () => this.props.closeModal('panel-container');
  toggleCollapse = name => () => this.setState({ collapseActive: this.state.collapseActive === name ? '' : name });

  renderLoading = () => <Fragment>
    <Loading isShown className={style.loading} />
  </Fragment>;

  renderPanel = () => {
    const chatName = getChatName(this.props.details);
    const countParticipants = this.props.details.group.participants.length;
    const currentUserParticipant = this.props.currentUser && find(this.props.details.group.participants, { user_id: this.props.currentUser.id });
    const isCurrentUserAdmin = currentUserParticipant && currentUserParticipant.role === 'admin';

    return <Fragment>
      <Button appearance="_icon-transparent" icon="arrow-left" onClick={this.closePanel} className={style.close} />

      <div className={style.scroll}>
        <div className={style.header}>
          <SubscriptionAvatar subscription={this.props.details} className={style.avatar} />
          <p className={style.name}>{chatName}</p>
          <p className={style.subcaption}>{countParticipants} {this.props.t('people')}</p>
        </div>

        <button className={style.button}>
          <Icon name="share" />
          <span>{this.props.t('copy_invite_link')}</span>
        </button>

        <button className={style.button}>
          <Icon name="notification" />
          <span>{this.props.t('notifications')}</span>
        </button>

        <button className={style.button} style={{ '--icon-size': '18px' }}>
          <Icon name="search" />
          <span>{this.props.t('search_in_conversation')}</span>
        </button>

        <button className={style.button} style={{ '--icon-size': '22px' }}>
          <Icon name="folder" />
          <span>{this.props.t('category')}</span>
        </button>

        {this.props.details.group.type === 'room' &&
          <div className={cx('collapse', { '_is-open': this.state.collapseActive === 'people' })}>
            <button className={style.collapse_button} onClick={this.toggleCollapse('people')}>
              <span>{this.props.t('people')}</span>
              <Icon name="arrow-down" />
            </button>

            <div className={style.collapse_list}>
              {this.props.details.group.participants.map(participant => {
                const user = this.props.users_list[participant.user_id];

                if (!user) {
                  return;
                }

                const userName = user.nick || 'no nick';
                const isAdmin = participant.role === 'admin';

                return <div key={user.id} className={style.person}>
                  <SubscriptionAvatar subscription={this.props.details} userId={user.id} className={style.avatar} />
                  <p>{userName}</p>
                  {isAdmin && <span>{this.props.t('admin')}</span>}

                  {isCurrentUserAdmin &&
                    <Dropdown
                      uniqueId={`panel-user-dropdown-${user.id}`}
                      className={style.dropdown}

                      items={[
                        { text: this.props.t('kick'), onClick: () => {} },
                      ]}
                    >
                      <Button appearance="_icon-transparent" icon="dots" />
                    </Dropdown>
                  }
                </div>;
              })}
            </div>
          </div>
        }

        <div className={cx('collapse', { '_is-open': this.state.collapseActive === 'extensions' })}>
          <button className={style.collapse_button} onClick={this.toggleCollapse('extensions')}>
            <span>{this.props.t('extensions')}</span>
            <Icon name="arrow-down" />
          </button>

          <div className={style.collapse_list}>
            Extensions
          </div>
        </div>

        <div className={cx('collapse', { '_is-open': this.state.collapseActive === 'transactions' })}>
          <button className={style.collapse_button} onClick={this.toggleCollapse('transactions')}>
            <span>{this.props.t('transactions')}</span>
            <Icon name="arrow-down" />
          </button>

          <div className={style.collapse_list}>
            Transactions
          </div>
        </div>

        <div className={cx('collapse', { '_is-open': this.state.collapseActive === 'files' })}>
          <button className={style.collapse_button} onClick={this.toggleCollapse('files')}>
            <span>{this.props.t('files')}</span>
            <Icon name="arrow-down" />
          </button>

          <div className={style.collapse_list}>
            Files
          </div>
        </div>

        <div className={cx('collapse', { '_is-open': this.state.collapseActive === 'photos' })}>
          <button className={style.collapse_button} onClick={this.toggleCollapse('photos')}>
            <span>{this.props.t('photos')}</span>
            <Icon name="arrow-down" />
          </button>

          <div className={style.collapse_list}>
            Photos
          </div>
        </div>
      </div>
    </Fragment>;
  };

  render() {
    return <div className={cx('panel', this.props.className, { '_is-shown': this.props.isShown })}>
      {!this.props.details && this.renderLoading()}
      {this.props.details && this.renderPanel()}
    </div>;
  }
}

export default compose(
  withDetails,
  withNamespaces('translation'),

  connect(
    state => ({
      currentUser: state.currentUser,
      isShown: state.modal_ids.indexOf('panel-container') !== -1,
      users_list: state.users.list,
    }),

    {
      closeModal: modalActions.closeModal,
    },
  ),
)(Panel);
