import React, { Component } from 'react';
import { connect } from 'react-redux';
import find from 'lodash/find';
import findLast from 'lodash/findLast';
import findIndex from 'lodash/findIndex';
import classnames from 'classnames/bind';
import compose from 'recompose/compose';
import SubscriptionAvatar from '@/components/subscription-avatar';
import style from './style.css';

const cx = classnames.bind(style);

export class Suggestion extends Component {
  state = {
    hoverUserIndex: 0,
  };

  selectUser = nick => () => this.props.onSelect(nick);

  handleDocumentKeyDown = event => {
    if (event.keyCode === 38) {
      this.moveHoverUp();
    }

    if (event.keyCode === 40) {
      this.moveHoverDown();
    }

    if (event.keyCode === 13) {
      const user = this.props.details.group.participants[this.state.hoverUserIndex].user;
      this.selectUser(user.nick)();
    }
  };

  moveHoverUp = () => {
    const prevUser = findLast([...this.props.details.group.participants].splice(0, this.state.hoverUserIndex), participant => !!participant.user.nick);

    if (prevUser) {
      const index = findIndex(this.props.details.group.participants, {user_id: prevUser.user_id});
      this.setState({ hoverUserIndex: index });
    }
  };

  moveHoverDown = () => {
    const nextUser = find([...this.props.details.group.participants].splice(this.state.hoverUserIndex + 1), participant => !!participant.user.nick);

    if (nextUser) {
      const index = findIndex(this.props.details.group.participants, {user_id: nextUser.user_id});
      this.setState({ hoverUserIndex: index });
    }
  };

  componentDidMount() {
    window.addEventListener('keydown', this.handleDocumentKeyDown);

    window.addEventListener('click', event => {
      if (this.suggestionRef && !this.suggestionRef.contains(event.target)) {
        this.props.onClose();
      }
    });
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleDocumentKeyDown);
  }

  render() {
    return <div className={cx('suggestion', this.props.className)} ref={node => this.suggestionRef = node}>
      {this.props.details.group.participants.map((participant, index) => {
        const user = this.props.users_list[participant.user.id];

        if (!user || !user.nick) {
          return;
        }

        if (this.props.search && !user.nick.toLowerCase().startsWith(this.props.search.toLowerCase())) {
          return;
        }

        return <button
          key={user.id}
          className={cx('item', {'_is-active': this.state.hoverUserIndex === index})}
          onClick={this.selectUser(user.nick)}
        >
          <SubscriptionAvatar subscription={this.props.details} userId={user.id} className={style.avatar} />
          <p className={style.name}>{user.nick}</p>
        </button>;
      })}
    </div>;
  }
}

export default compose(
  connect(
    (state, props) => ({
      details: state.subscriptions.list[props.subscription_id] || null,
      users_list: state.users.list,
    }),
  ),
)(Suggestion);
