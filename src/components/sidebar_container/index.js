import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import get from 'lodash/get';
import uniq from 'lodash/uniq';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import classnames from 'classnames/bind';
import SubscriptionItem from '@/components/subscription-item';
import SubscriptionAvatar from '@/components/subscription-avatar';
import Button from '@/components/button';
import SearchInput from '@/components/search-input';
import Loading from '@/components/loading';
import Dropdown from '@/components/dropdown';
import { api } from '@';
import { withSortedSubscriptions, withRouter } from '@/hoc';
import { getChatName, uid, getOpponentUser, getChatUrl } from '@/helpers';
import { actions as storeActions } from '@/store';
import { actions as subscriptionsActions } from '@/store/subscriptions';
import { actions as messagesActions } from '@/store/messages';
import { actions as usersActions } from '@/store/users';
import { actions as modalActions } from '@/components/modal_container';
import { actions as notificationActions } from '@/components/notification';
import style from './style.css';

const cx = classnames.bind(style);

class Sidebar extends Component {
  isSubscriptionInViewPort = element => {
    const parent = element.parentElement;
    const elementRect = element.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();

    if (elementRect.top >= parentRect.top && elementRect.bottom <= parentRect.bottom) {
      return true;
    }

    return false;
  };

  handleDocumentKeyDown = event => {
    const isChatOpen = this.props.params.chatId || this.props.params.userId;

    if (!isChatOpen && event.keyCode === 13) {
      if (this.props.hover_subscription_id) {
        const subscription = this.props.subscriptions_list[this.props.hover_subscription_id];
        const href = getChatUrl(subscription);
        this.props.setHoverSubscription(null);
        setTimeout(() => this.props.pushUrl(href));
      }
    }

    if (!isChatOpen && event.keyCode === 38) {
      if (this.props.hover_subscription_id) {
        const currentHoverIndex = this.props.sorted_subscriptions_ids.indexOf(this.props.hover_subscription_id);
        const prevSubscription = this.props.sorted_subscriptions_ids[currentHoverIndex - 1];

        if (currentHoverIndex > 0 && !!prevSubscription) {
          this.props.setHoverSubscription(prevSubscription);
          const prevSubscriptionRef = document.querySelector(`[data-subscription-id="${prevSubscription}"]`);

          if (!this.isSubscriptionInViewPort(prevSubscriptionRef)) {
            prevSubscriptionRef.scrollIntoView({block: 'start'});
          }
        }
      }

      if (!this.props.hover_subscription_id) {
        this.props.setHoverSubscription(this.props.sorted_subscriptions_ids[0]);
      }
    }

    if (!isChatOpen && event.keyCode === 40) {
      if (this.props.hover_subscription_id) {
        const currentHoverIndex = this.props.sorted_subscriptions_ids.indexOf(this.props.hover_subscription_id);
        const nextSubscription = this.props.sorted_subscriptions_ids[currentHoverIndex + 1];

        if (currentHoverIndex < this.props.sorted_subscriptions_ids.length - 1 && !!nextSubscription) {
          this.props.setHoverSubscription(nextSubscription);
          const nextSubscriptionRef = document.querySelector(`[data-subscription-id="${nextSubscription}"]`);

          if (!this.isSubscriptionInViewPort(nextSubscriptionRef)) {
            nextSubscriptionRef.scrollIntoView({block: 'end'});
          }
        }
      }

      if (!this.props.hover_subscription_id) {
        this.props.setHoverSubscription(this.props.sorted_subscriptions_ids[0]);
      }
    }
  };

  openAddChat = () => this.props.toggleModal({ id: 'new-chat-modal' });
  openEditProfileModal = () => this.props.toggleModal({ id: 'edit-profile-modal' });
  onSearchInput = event => this.props.filterSubscription({ text: event.target.value });
  filterSubscriptionsByTag = tag => this.props.filterSubscription({ tag });

  logout = () => api.logout().then(() => {
    this.props.clearMessages();
    this.props.clearSubscriptions();
    this.props.clearUsers();
    this.props.setCurrentUser(null);
    window.localStorage.removeItem('authToken');
    window.localStorage.removeItem('currentUser');
    this.props.router.push('/sign-in');
  }).catch(error => this.props.showNotification(this.props.t(error.text)));

  getSubscriptionHref = subscription => {
    if (subscription.group.type === 'private_chat' && !isEmpty(getOpponentUser(subscription))) {
      return `/chat/user/${getOpponentUser(subscription).id}`;
    }

    return `/chat/${subscription.id}`;
  };

  goToMessage = params => {
    const subscription = this.props.subscriptions_list[params.chatId];
    const href = this.getSubscriptionHref(subscription);
    this.props.router.push(`${href}/${params.messageId}`);
    const message = this.props.messages_list[params.messageId];

    let text = message.text;

    uniq(message.text.split(' ')).forEach(word => {
      if (!word.match(this.props.subscriptions_filter_text)) {
        return;
      }

      const regex = new RegExp(word, 'g');
      text = text.replace(regex, `<span>${word}</span>`);
    });

    this.props.updateMessage({
      chatId: params.chatId,

      message: {
        ...message,
        text,
      },
    });

    setTimeout(() => {
      this.props.updateMessage({
        chatId: params.chatId,

        message: {
          ...message,
          text: message.text,
        },
      });
    }, 3000);
  };

  goToChat = id => {
    const subscription = this.props.subscriptions_list[id];
    const href = this.getSubscriptionHref(subscription);
    this.props.router.push(href);
  };

  async componentWillMount() {
    const shortSubscriptions = await api.getSubscriptions({ short: true });
    this.props.loadSubscriptionsIds(shortSubscriptions.subscriptions);
  }

  componentDidMount() {
    window.addEventListener('keydown', this.handleDocumentKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleDocumentKeyDown);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const isSortedSubscriptionsLoaded = this.props.sorted_subscriptions_ids.length === 0 && nextProps.sorted_subscriptions_ids.length > 0;
    const isSubscriptionsChanged = !isEqual(this.props.subscriptions_list, nextProps.subscriptions_list);
    const isMessagesChanged = !isEqual(this.props.messages_list, nextProps.messages_list);
    const isCurrentUserChangedPhoto = this.props.currentUser && nextProps.currentUser && !isEqual(this.props.currentUser.avatar, nextProps.currentUser.avatar);
    const isStateChanged = !isEqual(this.state, nextState);
    const isTagFiltered = this.props.subscriptions_filter_tag !== nextProps.subscriptions_filter_tag;
    const isParamsChanged = !isEqual(this.props.params, nextProps.params);
    const isHoverSubscriptionChanged = this.props.hover_subscription_id !== nextProps.hover_subscription_id;

    const isFilteredIdsChanged = !isEqual(this.props.subscriptions_filtered_ids, nextProps.subscriptions_filtered_ids);
    const isFilteredContactsChanged = !isEqual(this.props.subscriptions_filtered_contacts_ids, nextProps.subscriptions_filtered_contacts_ids);
    const isFilteredMessagesChanged = !isEqual(this.props.subscriptions_filtered_messages, nextProps.subscriptions_filtered_messages);
    const isFiltering = isFilteredIdsChanged || isFilteredContactsChanged || isFilteredMessagesChanged;

    return isSortedSubscriptionsLoaded ||
      isSubscriptionsChanged ||
      isMessagesChanged ||
      isFiltering ||
      isCurrentUserChangedPhoto ||
      isTagFiltered ||
      isParamsChanged ||
      isHoverSubscriptionChanged ||
      isStateChanged;
  }

  render() {
    const isChatsLoaded = this.props.subscriptions_ids.length > 0 &&
      this.props.subscriptions_ids.length === Object.keys(this.props.subscriptions_list).length;

    const photo = get(this.props.currentUser, 'avatar.small', '/assets/default-user.jpg');

    return <div className={cx('sidebar', this.props.className)}>
      <div className={style.header}>
        <h1>Unichat</h1>

        <Dropdown
          uniqueId="sidebar-user-dropdown"
          className={style.dropdown}

          items={[
            { text: this.props.t('edit_profile'), onClick: this.openEditProfileModal },
            { text: this.props.t('log_out'), onClick: this.logout },
          ]}
        >
          <button className={style.image} style={{ '--bg-image': `url(${photo})` }} />
        </Dropdown>

        <Button appearance="_fab-divider" icon="add-chat" onClick={this.openAddChat} className={style.button} />
      </div>

      <SearchInput onInput={this.onSearchInput} className={style.search} />

      <div className={style.navigation}>
        <button
          className={cx({'_is-active': this.props.subscriptions_filter_tag === 'all'})}
          onClick={() => this.filterSubscriptionsByTag('all')}
        >{this.props.t('all')}</button>

        <button
          className={cx({'_is-active': this.props.subscriptions_filter_tag === 'personal'})}
          onClick={() => this.filterSubscriptionsByTag('personal')}
        >{this.props.t('personal')}</button>

        <button
          className={cx({'_is-active': this.props.subscriptions_filter_tag === 'work'})}
          onClick={() => this.filterSubscriptionsByTag('work')}
        >{this.props.t('work')}</button>
      </div>

      {this.props.subscriptions_filter_text &&
        <div className={style.list}>
          <p className={style.title}>{this.props.t('contact_plural')}</p>

          {this.props.subscriptions_filtered_contacts_ids &&
            this.props.subscriptions_filtered_contacts_ids.map(id => {
              const subscription = this.props.subscriptions_list[id];
              const name = getChatName(subscription);

              return <div
                key={id}
                className={style.contact}
                onClick={() => this.goToChat(subscription.id)}
              >
                <SubscriptionAvatar subscription={subscription} className={style.avatar} />
                <p className={style.name}>{name}</p>
              </div>;
            })}

          {this.props.subscriptions_filtered_contacts_ids.length === 0 &&
            <p className={style.empty}>{this.props.t('no_results')}</p>}

          <p className={style.title}>{this.props.t('message_plural')}</p>

          {this.props.sorted_subscriptions_ids &&
            this.props.sorted_subscriptions_ids.map(id => {
              const messages = this.props.subscriptions_filtered_messages[id];

              return messages.map(messageId => <SubscriptionItem
                key={uid()}
                id={id}
                messageId={messageId}
                onClick={() => this.goToMessage({ chatId: id, messageId })}
                className={style.subscription}
              />);
            })}

          {this.props.sorted_subscriptions_ids.length === 0 &&
            <p className={style.empty}>{this.props.t('no_results')}</p>}
        </div>
      }

      {!this.props.subscriptions_filter_text &&
        <div className={style.list}>
          {this.props.sorted_subscriptions_ids &&
            this.props.sorted_subscriptions_ids.map(id => <SubscriptionItem
              key={id}
              id={id}
              className={cx('subscription', {'_is-user-hover': id === this.props.hover_subscription_id})}
              withLoadData
              withDataId
            />)}

          {this.props.sorted_subscriptions_ids.length === 0 &&
            <p className={style.empty}>{this.props.t('no_chats')}</p>}
        </div>
      }

      <Loading isShown={!isChatsLoaded} className={style.loading} />
    </div>;
  }
}

export default compose(
  withRouter,
  withNamespaces('translation'),

  connect(
    state => ({
      currentUser: state.currentUser,
      subscriptions_ids: state.subscriptions.ids,
      subscriptions_list: state.subscriptions.list,
      subscriptions_filtered_messages: state.subscriptions.filtered_messages,
      subscriptions_filtered_contacts_ids: state.subscriptions.filtered_contacts_ids,
      subscriptions_filtered_ids: state.subscriptions.filtered_ids,
      subscriptions_filter_tag: state.subscriptions.filter_tag,
      subscriptions_filter_text: state.subscriptions.filter_text,
      hover_subscription_id: state.subscriptions.hover_subscription_id,
      messages_list: state.messages.list,
    }),

    {
      loadSubscriptionsIds: subscriptionsActions.loadSubscriptionsIds,
      toggleModal: modalActions.toggleModal,
      setCurrentUser: storeActions.setCurrentUser,
      showNotification: notificationActions.showNotification,
      setHoverSubscription: subscriptionsActions.setHoverSubscription,
      filterSubscription: subscriptionsActions.filterSubscription,
      clearSubscriptions: subscriptionsActions.clearSubscriptions,
      updateMessage: messagesActions.updateMessage,
      clearMessages: messagesActions.clearMessages,
      clearUsers: usersActions.clearUsers,
    },
  ),

  withSortedSubscriptions(props => ({
    ids: props.subscriptions_filtered_ids,
  })),
)(Sidebar);
