import React, { Component, Fragment } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import SubscriptionAvatar from '@/components/subscription-avatar';
import { actions as modalActions } from '@/components/modal_container';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

class Tasks extends Component {
  openNewTaskModal = () => this.props.toggleModal({ id: 'new-task-modal' });

  render() {
    return <Fragment>
      <div className={style.navigation}>
        <button type="button" className={cx('tab', {'_is-active': true})}>All</button>
        <button type="button" className={style.tab}>My tasks</button>
        <button type="button" className={style.tab}>Archived</button>
        <button type="button" className={style.new} onClick={this.openNewTaskModal}>New</button>
      </div>

      <div className={style.item}>
        <div className={style.circle} />
        <p className={style.text}>Fix header on iPhoneX</p>
      </div>

      <div className={style.item}>
        <div className={style.circle} />
        <p className={style.text}>Create new UX for the search</p>
      </div>

      <div className={style.item}>
        <div className={style.circle} />
        <p className={style.text}>Template for images</p>
        <SubscriptionAvatar className={style.avatar} userId={55} />
      </div>

      <button type="button" className={style.all}>Show all (21)</button>
    </Fragment>;
  }
}

export default compose(
  connect(
    null,

    {
      toggleModal: modalActions.toggleModal,
    },
  ),
)(Tasks);
