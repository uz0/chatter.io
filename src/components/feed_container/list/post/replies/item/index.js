import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import find from 'lodash/find';
import get from 'lodash/get';
import moment from 'moment';
import SubscriptionAvatar from '@/components/subscription-avatar';
import { renderText } from '@/components/feed_container/list/post';
import { withRouter } from '@/hoc';
import { withTranslation } from 'react-i18next';
import style from './style.css';

class Item extends Component {
  getFormattedDate = date => {
    const diff = moment().diff(moment(date));
    const diffInMinutes = moment.duration(diff).asMinutes();

    if (diffInMinutes < 30) {
      setTimeout(() => {
        if (this._isMounted) {
          this.forceUpdate();
        }
      }, 60000);

      return `${Math.ceil(diffInMinutes)} min ago`;
    }

    if (moment(date).isSame(moment(), 'day')) {
      return `Today at ${moment(date).format('HH:mm')}`;
    }

    return moment(date).format('DD MMMM, HH:mm');
  };

  onMessageClick = event => {
    const targetLink = event.target.closest('a');

    if (!targetLink) {
      return;
    }

    if (targetLink.getAttribute('target')) {
      return;
    }

    event.preventDefault();
    let href = targetLink.href;

    if (href.indexOf(location.origin) !== -1) {
      href = href.replace(location.origin, '');
    }

    this.props.pushUrl(href);
  };

  render() {
    const username = this.props.author && this.props.author.nick || 'no nick';
    const userId = this.props.author && this.props.author.id;
    const date = this.getFormattedDate(this.props.created_at);
    const text = renderText(this.props.text, this.props.mentions, this.props.details);

    return <div className={style.item}>
      <div className={style.header}>
        <SubscriptionAvatar userId={userId} className={style.avatar} />
        <p className={style.name}>{username}</p>
        <p className={style.date}>{date}</p>
      </div>

      <p className={style.text} dangerouslySetInnerHTML={{__html: text}} onClick={this.onMessageClick} />
    </div>;
  }
}

export default compose(
  withRouter,
  withTranslation(),

  connect(
    (state, props) => ({
      message_id: get(find(state.messages.list, { uid: props.uid }), 'id'),
      user_id: get(find(state.messages.list, { uid: props.uid }), 'user_id'),
      created_at: get(find(state.messages.list, { uid: props.uid }), 'created_at'),
      text: get(find(state.messages.list, { uid: props.uid }), 'text'),
      group_id: get(find(state.messages.list, { uid: props.uid }), 'group_id'),
      mentions: get(find(state.messages.list, { uid: props.uid }), 'mentions'),
    }),
  ),

  connect(
    (state, props) => ({
      details: find(state.subscriptions.list, { group_id: props.group_id }),
      author: state.users.list[props.user_id],
    }),
  ),
)(Item);
