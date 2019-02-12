import React, { Component } from 'react';
import { withNamespaces } from 'react-i18next';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

class Xtag extends Component {
  render() {
    const author = this.props.users_list[this.props.message.user_id];
    const ref = this.props.users_list[this.props.message.reference.id];

    const authorNick = author && author.nick || 'no nick';
    const refNick = ref && ref.nick || 'no nick';

    const isInvite = this.props.message.xtag === 'invite';
    const isCreation = this.props.message.xtag === 'creation';
    const isLeave = this.props.message.xtag === 'leave';
    const isKick = this.props.message.xtag === 'kick_out';
    const isJoined = this.props.message.xtag === 'joined';

    let text = '';

    if (isKick) {
      text = this.props.t('xtag_message_kick', { user_nick: authorNick, reference_user_nick: refNick });
    }

    if (isLeave) {
      text = this.props.t('xtag_message_leave', { user_nick: authorNick });
    }

    if (isCreation) {
      text = this.props.t('xtag_message_creation', { user_nick: authorNick });
    }

    if (isInvite) {
      text = this.props.t('xtag_message_invite', { user_nick: authorNick, reference_user_nick: refNick });
    }

    if (isJoined) {
      text = this.props.t('xtag_message_joined', { user_nick: authorNick });
    }

    return <p
      className={cx('xtag', this.props.className)}
      dangerouslySetInnerHTML={{__html: text}}
    />;
  }
}

export default compose(
  withNamespaces('translation'),

  connect(
    (state, props) => ({
      message: state.messages.list[props.id],
      users_list: state.users.list,
    }),
  ),
)(Xtag);
