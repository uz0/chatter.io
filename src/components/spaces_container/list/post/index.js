import React, { Component } from 'react';
import find from 'lodash/find';
import get from 'lodash/get';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import classnames from 'classnames/bind';
import moment from 'moment';
import Attachments from './attachments';
import SubscriptionAvatar from '@/components/subscription-avatar';
import { withTranslation } from 'react-i18next';
import Button from '@/components/button';
import style from './style.css';

const cx = classnames.bind(style);

class Post extends Component {
  _isMounted = false;

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

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    const username = this.props.author && this.props.author.nick || 'no nick';
    const userId = this.props.author && this.props.author.id;
    const date = this.getFormattedDate(this.props.created_at);

    return <div className={cx('post', this.props.className)}>
      <div className={style.header}>
        <SubscriptionAvatar userId={userId} className={style.avatar} />
        <p className={style.name}>{username}</p>
        <p className={style.caption}>{date}</p>
        <Button appearance="_icon-transparent" icon="dots" className={style.action} />
      </div>

      <div className={style.content}>
        {this.props.text &&
          <p className={style.text}>{this.props.text}</p>
        }

        <Attachments
          uid={this.props.uid}
          galleryClassName={style.gallery}
          filesClassName={style.files}
        />
      </div>

      <div className={style.footer}>
        <input placeholder="Reply" className={style.reply_input} />
        <Button appearance="_icon-transparent" icon="plus" className={style.action} />
      </div>
    </div>;
  }
}

export default compose(
  withTranslation(),

  connect(
    (state, props) => ({
      user_id: get(find(state.messages.list, { uid: props.uid }), 'user_id'),
      created_at: get(find(state.messages.list, { uid: props.uid }), 'created_at'),
      text: get(find(state.messages.list, { uid: props.uid }), 'text'),
    }),
  ),

  connect(
    (state, props) => ({
      author: state.users.list[props.user_id],
    }),
  ),
)(Post);
