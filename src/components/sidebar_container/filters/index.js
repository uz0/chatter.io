import React, { Component, Fragment } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import get from 'lodash/get';
import uniq from 'lodash/uniq';
import isEmpty from 'lodash/isEmpty';
import Section from '@/components/sidebar_container/section';
import SubscriptionItem from '@/components/subscription-item';
import SubscriptionAvatar from '@/components/subscription-avatar';
import { api } from '@';
import { withSortedSubscriptions, withRouter } from '@/hoc';
import { getChatName, uid, getOpponentUser } from '@/helpers';
import { actions as subscriptionsActions } from '@/store/subscriptions';
import { actions as messagesActions } from '@/store/messages';
import { actions as usersActions } from '@/store/users';
import style from './style.css';

class Filters extends Component {
  getSubscriptionHref = subscription => {
    if (subscription.group.type === 'private_chat' && !isEmpty(getOpponentUser(subscription))) {
      return `/chat/user/${getOpponentUser(subscription).id}`;
    }

    return `/chat/${subscription.id}`;
  };

  stopSearchingMessages = () => this.props.toggleSearchMessages(false);

  goToMessage = params => () => {
    const subscription = this.props.subscriptions_list[params.chatId];
    const href = this.getSubscriptionHref(subscription);
    this.props.pushUrl(`${href}/${params.messageId}`);
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

  goToChat = id => () => {
    const subscription = this.props.subscriptions_list[id];
    const href = this.getSubscriptionHref(subscription);
    this.props.pushUrl(href);
  };

  goToGlobalChat = id => () => {
    api.getPrivateSubscription({ user_id: id }).then(data => {
      if (this.props.subscriptions_ids.indexOf(data.subscription.id) === -1) {
        this.props.addUsers(data.subscription.group.participants);
        this.props.addSubscription(data.subscription);
      }

      this.props.pushUrl(`/chat/user/${id}`);
    });
  };

  getFilteredMessages = sortedSubscriptionsIds => {
    if (!sortedSubscriptionsIds) {
      return [];
    }

    let messages = [];

    this.props.sorted_subscriptions_ids.forEach(chatId => {
      const chatMessages = this.props.subscriptions_filtered_messages[chatId] || [];

      chatMessages.forEach(messageId => {
        messages.push({ chatId, messageId });
      });
    });

    return messages;
  };

  renderContact = ({ item }) => {
    const subscription = this.props.subscriptions_list[item];
    const name = getChatName(subscription);

    return <div
      key={item}
      className={style.contact}
      onClick={this.goToChat(subscription.id)}
    >
      <SubscriptionAvatar subscription={subscription} className={style.avatar} />
      <p className={style.name}>{name}</p>
    </div>;
  };

  renderGlobalContact = ({ item }) => {
    const name = get(item, 'nick', 'no nick') || 'no nick';

    return <div
      key={item.id}
      className={style.contact}
      onClick={this.goToGlobalChat(item.id)}
    >
      <SubscriptionAvatar user={item} className={style.avatar} />
      <p className={style.name}>{name}</p>
    </div>;
  };

  renderSubscription = ({ item }) => {
    return <SubscriptionItem
      key={uid()}
      id={item.chatId}
      messageId={item.messageId}
      onClick={this.goToMessage({ chatId: item.chatId, messageId: item.messageId })}
      className={style.subscription}
    />;
  };

  render() {
    const filteredMessages = this.getFilteredMessages(this.props.sorted_subscriptions_ids);
    const stopSearchAction = { text: this.props.t('stop_loading'), onClick: this.stopSearchingMessages};

    return <Fragment>
      <Section
        title={this.props.t('contact_plural')}
        emptyMessage={this.props.t('no_results')}
        items={this.props.subscriptions_filtered_contacts_ids}
        renderItem={this.renderContact}
      />

      <Section
        title={this.props.t('global_search')}
        emptyMessage={this.props.t('no_results')}
        items={this.props.subscriptions_filtered_global_users}
        renderItem={this.renderGlobalContact}
      />

      <Section
        title={this.props.t('message_plural')}
        isLoading={this.props.is_searching_old_messages}
        emptyMessage={this.props.t('no_results')}
        items={filteredMessages}
        renderItem={this.renderSubscription}
        {...this.props.is_searching_old_messages ? {action: stopSearchAction} : {}}
      />
    </Fragment>;
  }
}

export default compose(
  withRouter,
  withTranslation(),

  connect(
    state => ({
      subscriptions_ids: state.subscriptions.ids,
      subscriptions_list: state.subscriptions.list,
      subscriptions_filtered_messages: state.subscriptions.filtered_messages,
      subscriptions_filtered_contacts_ids: state.subscriptions.filtered_contacts_ids,
      subscriptions_filtered_global_users: state.subscriptions.filtered_global_users,
      subscriptions_filtered_ids: state.subscriptions.filtered_ids,
      subscriptions_filter_text: state.subscriptions.filter_text,
      is_searching_old_messages: state.subscriptions.is_searching_old_messages,
      messages_list: state.messages.list,
    }),

    {
      addSubscription: subscriptionsActions.addSubscription,
      toggleSearchMessages: subscriptionsActions.toggleSearchMessages,
      updateMessage: messagesActions.updateMessage,
      addUsers: usersActions.addUsers,
    },
  ),

  withSortedSubscriptions(props => ({
    ids: props.subscriptions_filtered_ids,
  })),
)(Filters);
