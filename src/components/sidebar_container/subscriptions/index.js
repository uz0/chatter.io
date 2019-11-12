import React, { Component } from 'react';
import compose from 'recompose/compose';
import withProps from 'recompose/withProps';
import find from 'lodash/find';
import map from 'lodash/map';
import filter from 'lodash/filter';
import sortBy from 'lodash/sortBy';
import { connect } from 'react-redux';
import classnames from 'classnames/bind';
import Icon from '@/components/icon';
import Section from '@/components/sidebar_container/section';
import SubscriptionItem from '@/components/subscription-item';
import FeedItem from './feed-item';
import { withSortedSubscriptions, withRouter } from '@/hoc';
import { getChatUrl } from '@/helpers';
import { actions as subscriptionsActions } from '@/store/subscriptions';
import { actions as modalActions } from '@/components/modal_container';
import style from './style.css';

const cx = classnames.bind(style);

class Filters extends Component {
  isSubscriptionInViewPort = element => {
    const parent = document.querySelector('#sidebar-scroll');
    const elementRect = element.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();

    if (elementRect.top >= parentRect.top && elementRect.bottom <= parentRect.bottom) {
      return true;
    }

    return false;
  };

  setHoverUp = () => {
    if (!this.props.hover_subscription_id) {
      this.props.setHoverSubscription(this.props.chats_ids[0]);
      return;
    }

    const currentHoverIndex = this.props.chats_ids.indexOf(this.props.hover_subscription_id);
    const prevSubscription = this.props.chats_ids[currentHoverIndex - 1];

    if (currentHoverIndex > 0 && !!prevSubscription) {
      this.props.setHoverSubscription(prevSubscription);
      const prevSubscriptionRef = document.querySelector(`[data-subscription-id="${prevSubscription}"]`);

      if (!this.isSubscriptionInViewPort(prevSubscriptionRef)) {
        prevSubscriptionRef.scrollIntoView({ block: 'start' });
      }
    }
  };

  setHoverDown = () => {
    if (!this.props.hover_subscription_id) {
      this.props.setHoverSubscription(this.props.chats_ids[0]);
      return;
    }

    const currentHoverIndex = this.props.chats_ids.indexOf(this.props.hover_subscription_id);
    const nextSubscription = this.props.chats_ids[currentHoverIndex + 1];

    if (currentHoverIndex < this.props.chats_ids.length - 1 && !!nextSubscription) {
      this.props.setHoverSubscription(nextSubscription);
      const nextSubscriptionRef = document.querySelector(`[data-subscription-id="${nextSubscription}"]`);

      if (!this.isSubscriptionInViewPort(nextSubscriptionRef)) {
        nextSubscriptionRef.scrollIntoView({ block: 'end' });
      }
    }
  };

  selectChat = () => {
    if (!this.props.hover_subscription_id) {
      return;
    }

    const subscription = this.props.subscriptions_list[this.props.hover_subscription_id];
    const href = getChatUrl(subscription);
    this.props.setHoverSubscription(null);
    setTimeout(() => this.props.pushUrl(href));
  };

  handleDocumentKeyDown = event => {
    const isChatOpen = this.props.match.params.chatId || this.props.match.params.userId;

    if (!isChatOpen && event.keyCode === 13) {
      this.selectChat();
    }

    if (!isChatOpen && event.keyCode === 38) {
      this.setHoverUp();
    }

    if (!isChatOpen && event.keyCode === 40) {
      this.setHoverDown();
    }
  };

  openNewSpace = () => this.props.pushUrl('/new-space');

  renderFeed = ({ item }) => {
    if (item === 'new-space-mock'){
      return <div key={'new-space-mock'} className={cx('feed_item', 'feed_item_active')}>
        <Icon name="plus" />
        <p className={style.caption}>New space</p>
      </div>;
    }
    
    if (item === 'all-spaces'){
      return <button key={'all-spaces'} className={cx('feed_item')} onClick={() => {}}>
        <Icon name="plus" />
        <p className={style.caption}>All spaces</p>
      </button>;
    }

    return <FeedItem key={item} id={item} className={style.feed} />;
  };

  renderNewMessageButton = () => {
    return <div key="new-message-button" className={style.new_message}>
      <div className={style.section}>
        <Icon name="plus" />
      </div>

      <p className={style.title}>New Message</p>
    </div>;
  };

  renderSubscription = ({ item }) => {
    if (item === 'new-message') {
      return this.renderNewMessageButton();
    }

    return <SubscriptionItem
      key={item}
      id={item}
      className={cx('subscription', { '_is-user-hover': item === this.props.hover_subscription_id })}
      withLoadData
      withDataId
    />;
  };

  isSubscriptionsLoaded = () => {
    if (!this.props.match.params.orgId) {
      return !!find(this.props.subscriptions_list, subscription => subscription && !subscription.group.organization_id && !subscription.group.is_space && !subscription.is_add_data_loaded) || false;
    }

    const id = parseInt(this.props.match.params.orgId, 10);
    return !!find(this.props.subscriptions_list, subscription => subscription && subscription.group.organization_id === id && !subscription.group.is_space && !subscription.is_add_data_loaded) || false;
  };

  renderEmptyFeed = () => {
    return <button className={style.subscription_empty}>
      <Icon name="plus" />
      <span className={style.text}>Create first public space</span>
    </button>;
  };

  renderEmptySubscription = () => {
    return <button className={style.subscription_empty}>
      <Icon name="plus" />
      <span className={style.text}>Say Hello to colleagues</span>
    </button>;
  };

  componentDidMount() {
    window.addEventListener('keydown', this.handleDocumentKeyDown);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleDocumentKeyDown);
  }

  render() {
    const isHasSubscriptionsWithNotLoadedAddData = this.isSubscriptionsLoaded();
    const isSubscriptionsLoading = this.props.isLoading || isHasSubscriptionsWithNotLoadedAddData || false;
    const isNewSpaceModalShown = this.props.location.pathname === '/new-space';
    const isFeedExist = this.props.feeds.length > 0;
    let chatIds = this.props.chats_ids;
    let feeds = isNewSpaceModalShown ? ['new-space-mock', ...this.props.feeds] : this.props.feeds;

    if (this.props.isNewDialogueModalShown) {
      chatIds = ['new-message', ...chatIds];
    }

    return <div className={cx('wrapper', {'_is-loading': isSubscriptionsLoading})}>
      <Section
        items={feeds}
        title="Feeds"
        emptyMessage={this.renderEmptyFeed}
        renderItem={this.renderFeed}
        className={style.section}
        {...isFeedExist ? {action: {text: 'New', onClick: this.openNewSpace}} : {}}
      />

      <Section
        items={chatIds}
        title="Messages"
        emptyMessage={this.renderEmptySubscription}
        renderItem={this.renderSubscription}
        className={style.section}
      />
    </div>;
  }
}

export default compose(
  withRouter,

  connect(
    state => ({
      subscriptions_filtered_ids: state.subscriptions.filtered_ids,
      subscriptions_list: state.subscriptions.list,
      hover_subscription_id: state.subscriptions.hover_subscription_id,
      isNewDialogueModalShown: state.modal.ids.indexOf('new-dialogue-modal') !== -1,
    }),

    {
      setHoverSubscription: subscriptionsActions.setHoverSubscription,
      toggleModal: modalActions.toggleModal,
    },
  ),

  withSortedSubscriptions(props => {
    let ids = map(props.subscriptions_filtered_ids, id => props.subscriptions_list[id]);

    if (props.match.params.orgId) {
      ids = filter(ids, item => item.group.organization_id === parseInt(props.match.params.orgId, 10));
    } else {
      ids = filter(ids, item => !item.group.organization_id);
    }

    ids = map(ids, 'id');

    return {
      ids,
    };
  }),

  withProps(props => {
    let feeds = map(props.sorted_subscriptions_ids, id => props.subscriptions_list[id]);
    feeds = filter(feeds, item => item.group.is_space);
    feeds = sortBy(feeds, item => item.group.name);

    let chats = map(props.sorted_subscriptions_ids, id => props.subscriptions_list[id]);
    chats = filter(chats, item => !item.group.is_space);

    return {
      feeds: map(feeds, item => item.id),
      chats_ids: map(chats, chat => chat.id),
    };
  }),
)(Filters);
