import React, { Component } from 'react';
import compose from 'recompose/compose';
import withProps from 'recompose/withProps';
import find from 'lodash/find';
import map from 'lodash/map';
import filter from 'lodash/filter';
import sortBy from 'lodash/sortBy';
import { connect } from 'react-redux';
import classnames from 'classnames/bind';
import Link from '@/components/link';
import Icon from '@/components/icon';
import Section from '@/components/sidebar_container/section';
import SubscriptionItem from '@/components/subscription-item';
import { withSortedSubscriptions, withRouter } from '@/hoc';
import { getChatUrl } from '@/helpers';
import { actions as subscriptionsActions } from '@/store/subscriptions';
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

  renderSpace = ({ item }) => {
    return <Link to={`/chat/${item.id}`} key={item.id} activeClassName="_is-active" className={style.space}>
      <Icon name="hashtag" />
      <p className={style.name}>{item.group.name}</p>

      {false &&
        <div className={style.point} />
      }
    </Link>;
  };

  renderSubscription = ({ item }) => {
    return <SubscriptionItem
      key={item}
      id={item}
      className={cx('subscription', { '_is-user-hover': item === this.props.hover_subscription_id })}
      withLoadData
      withDataId
    />;
  }

  componentDidMount() {
    window.addEventListener('keydown', this.handleDocumentKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleDocumentKeyDown);
  }

  render() {
    const isHasSubscriptionsWithNotLoadedAddData = !!find(this.props.subscriptions_list, subscription => subscription && !subscription.is_space && !subscription.is_add_data_loaded);
    const isSubscriptionsLoading = this.props.isLoading || isHasSubscriptionsWithNotLoadedAddData || false;

    return <div className={cx('wrapper', {'_is-loading': isSubscriptionsLoading})}>
      <Section
        items={this.props.spaces}
        title="Spaces"
        emptyMessage="There is no spaces yet"
        renderItem={this.renderSpace}
        className={style.section}
      />

      <Section
        items={this.props.chats_ids}
        title="Messages"
        emptyMessage="There is no subscriptions yet"
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
    }),

    {
      setHoverSubscription: subscriptionsActions.setHoverSubscription,
    },
  ),

  withSortedSubscriptions(props => ({
    ids: props.subscriptions_filtered_ids,
  })),

  withProps(props => {
    let spaces = map(props.sorted_subscriptions_ids, id => props.subscriptions_list[id]);
    spaces = filter(spaces, item => item.is_space);
    spaces = sortBy(spaces, item => item.group.name);

    let chats = map(props.sorted_subscriptions_ids, id => props.subscriptions_list[id]);
    chats = filter(chats, item => !item.is_space);

    return {
      spaces,
      chats_ids: map(chats, chat => chat.id),
    };
  }),
)(Filters);
