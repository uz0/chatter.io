import React, { Component } from 'react';
import find from 'lodash/find';
import get from 'lodash/get';
import map from 'lodash/map';
import isEqual from 'lodash/isEqual';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import classnames from 'classnames/bind';
import moment from 'moment';
import Dropdown from '@/components/dropdown';
import Attachments from './attachments';
import Replies from './replies';
import ReplyInput from './reply-input';
import { api } from '@';
import { withRouter } from '@/hoc';
import SubscriptionAvatar from '@/components/subscription-avatar';
import { withTranslation } from 'react-i18next';
import { getChatUrl } from '@/helpers';
import Button from '@/components/button';
import { actions as notificationActions } from '@/components/notification';
import modalActions from '@/components/modal_container/actions';
import { actions as messagesActions } from '@/store/messages';
import style from './style.css';

const cx = classnames.bind(style);
const linkreg = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
const tagreg = /\B\#\w\w+\b/gim;

export const renderText = (text, mentions, details) => {
  if (!text) {
    return;
  }

  if (!text.replace(/\s/g, '').length) {
    return;
  }

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  if (mentions) {
    mentions.forEach(mention => {
      let link = '';

      if (mention.user_id === currentUser.id) {
        link = `<a>@${mention.text}</a>`;
      } else {
        link = `<a href="/chat/user/${mention.user_id}">@${mention.text}</a>`;
      }

      text = text.split(`@${mention.text}`).join(link);
    });
  }

  if (text.match(linkreg)) {
    text = text.replace(linkreg, '<a href="$1" target="_blank">$1</a>');
  }

  if (text.match(tagreg)) {
    const href = getChatUrl(details);
    text = text.replace(tagreg, tag => `<a href="${href}/tag/${tag.replace('#', '')}">${tag}</a>`);
  }

  return text;
};

class Post extends Component {
  _isMounted = false;

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

  openForwardModal = () => {
    if (!this.props.message_id) {
      return;
    }

    this.props.addForwardMessage(this.props.message_id);
    this.props.toggleModal({ id: 'forward-modal' });
  };

  delete = () => api.deleteMessage({ message_id: this.props.message_id }).catch(error => this.props.showNotification({
    type: 'error',
    text: this.props.t(error.code),
  }));

  isParticipantsChanged = nextProps => {
    const participants = map(this.props.details.group.participants, participant => participant.user_id).sort();
    const nextPropsParticipants = map(nextProps.details.group.participants, participant => participant.user_id).sort();

    return !isEqual(participants, nextPropsParticipants);
  };

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  shouldComponentUpdate(nextProps) {
    const isMessageIdChanged = this.props.message_id !== nextProps.message_id;
    const isUserIdChanged = this.props.user_id !== nextProps.user_id;
    const isCreatedChanged = this.props.created_at !== nextProps.created_at;
    const isTextChanged = this.props.text !== nextProps.text;
    const isGroupIdChanged = this.props.group_id !== nextProps.group_id;
    const isMentionsChanged = !isEqual(this.props.mentions, nextProps.mentions);
    const isAuthorChanged = !isEqual(this.props.author, nextProps.author);
    const isParticipantsChanged = this.isParticipantsChanged(nextProps);

    return isMessageIdChanged ||
      isUserIdChanged ||
      isCreatedChanged ||
      isTextChanged ||
      isGroupIdChanged ||
      isMentionsChanged ||
      isAuthorChanged ||
      isParticipantsChanged;
  }

  render() {
    const username = this.props.author && this.props.author.nick || 'no nick';
    const userId = this.props.author && this.props.author.id;
    const date = this.getFormattedDate(this.props.created_at);
    const text = renderText(this.props.text, this.props.mentions, this.props.details);

    const actions = [
      {icon: 'forward', text: this.props.t('forward'), onClick: this.openForwardModal},
      {icon: 'delete', text: this.props.t('delete'), onClick: this.delete, isDanger: true},
    ];

    return <div className={cx('post', this.props.className)}>
      <div className={style.header}>
        <SubscriptionAvatar userId={userId} className={style.avatar} />
        <p className={style.name}>{username}</p>
        <p className={style.caption}>{date}</p>

        <Dropdown
          uniqueId={`message-dropdown-${this.props.uid}`}
          className={style.dropdown}
          items={actions}
        >
          <Button appearance="_icon-transparent" icon="dots" className={style.action} />
        </Dropdown>
      </div>

      <div className={style.content}>
        {text &&
          <p className={style.text} dangerouslySetInnerHTML={{__html: text}} onClick={this.onMessageClick} />
        }

        <Attachments
          uid={this.props.uid}
          galleryClassName={style.gallery}
          filesClassName={style.files}
        />

        <Replies
          subscriptionId={this.props.details.id}
          messageId={this.props.message_id}
        />
      </div>

      <ReplyInput
        subscriptionId={this.props.details.id}
        messageId={this.props.message_id}
        className={style.reply_input}
      />
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

    {
      addForwardMessage: messagesActions.addForwardMessage,
      toggleModal: modalActions.toggleModal,
      showNotification: notificationActions.showNotification,
    },
  ),

  connect(
    (state, props) => ({
      details: find(state.subscriptions.list, { group_id: props.group_id }),
      author: state.users.list[props.user_id],
    }),
  ),
)(Post);
