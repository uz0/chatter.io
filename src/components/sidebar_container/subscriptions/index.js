import React, { Component } from 'react';
import compose from 'recompose/compose';
import find from 'lodash/find';
import { connect } from 'react-redux';
import classnames from 'classnames/bind';
import Section from '@/components/sidebar_container/section';
import SubscriptionItem from '@/components/subscription-item';
import { withSortedSubscriptions, withRouter } from '@/hoc';
import { getChatUrl } from '@/helpers';
import { actions as subscriptionsActions } from '@/store/subscriptions';
import style from './style.css';

const cx = classnames.bind(style);

class Filters extends Component {
  isSubscriptionInViewPort = element => {
    const parent = element.parentElement;
    const elementRect = element.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();

    if (elementRect.top >= parentRect.top && elementRect.bottom <= parentRect.bottom) {
      return true;
    }

    return false;
  };

  setHoverUp = () => {
    if (!this.props.hover_subscription_id) {
      this.props.setHoverSubscription(this.props.sorted_subscriptions_ids[0]);
      return;
    }

    const currentHoverIndex = this.props.sorted_subscriptions_ids.indexOf(this.props.hover_subscription_id);
    const prevSubscription = this.props.sorted_subscriptions_ids[currentHoverIndex - 1];

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
      this.props.setHoverSubscription(this.props.sorted_subscriptions_ids[0]);
      return;
    }

    const currentHoverIndex = this.props.sorted_subscriptions_ids.indexOf(this.props.hover_subscription_id);
    const nextSubscription = this.props.sorted_subscriptions_ids[currentHoverIndex + 1];

    if (currentHoverIndex < this.props.sorted_subscriptions_ids.length - 1 && !!nextSubscription) {
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

  componentDidMount() {
    window.addEventListener('keydown', this.handleDocumentKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleDocumentKeyDown);
  }

  renderSubscription = ({ item }) => {
    return <SubscriptionItem
      key={item}
      id={item}
      className={cx('subscription', { '_is-user-hover': item === this.props.hover_subscription_id })}
      withLoadData
      withDataId
    />;
  }

  render() {
    const isHasSubscriptionsWithNotLoadedAddData = !!find(this.props.subscriptions_list, subscription => !subscription.is_add_data_loaded);
    const isSubscriptionsLoading = this.props.isLoading || isHasSubscriptionsWithNotLoadedAddData || false;

    return <Section
      items={this.props.sorted_subscriptions_ids}
      emptyMessage="There is no subscriptions yet"
      renderItem={this.renderSubscription}
      className={cx('section', {'_is-loading': isSubscriptionsLoading})}
    />;
  }
}

export default compose(
  withRouter,

  connect(
    state => ({
      subscriptions_filtered_ids: state.subscriptions.filtered_ids,
      subscriptions_list: state.subscriptions.list,
      hover_subscription_id: state.subscriptions.hover_subscription_id,
    }),

    {
      setHoverSubscription: subscriptionsActions.setHoverSubscription,
    },
  ),

  withSortedSubscriptions(props => ({
    ids: props.subscriptions_filtered_ids,
  })),
)(Filters);
