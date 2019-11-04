import React, { Component } from 'react';
import Icon from '@/components/icon';
import SubscriptionAvatar from '@/components/subscription-avatar';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

class Tasks extends Component {
  render() {
    return <div className={cx('popup', this.props.className)}>
      <div className={style.navigation}>
        <button type="button" className={style.tab}>All tasks</button>
        <button type="button" className={cx('tab', {'_is-active': true})}>My tasks</button>

        <button className={style.open}>
          <Icon name="full-screen-half" />
        </button>
      </div>

      <div className={style.list}>
        <button className={style.new}>+ New To-Do</button>

        <div className={style.section}>
          <SubscriptionAvatar className={style.avatar} userId={55} />
          <p className={style.name}>Alexander</p>
          <button className={style.all}>See all</button>
        </div>

        <div className={style.task}>
          <div className={style.circle} />
          <p className={style.title}>Fix header on iPhoneX</p>
          <SubscriptionAvatar className={style.avatar} userId={55} />
        </div>

        <div className={style.task}>
          <div className={style.circle} />
          <p className={style.title}>Fix header on iPhoneX</p>
          <SubscriptionAvatar className={style.avatar} userId={55} />
        </div>

        <div className={style.task}>
          <div className={style.circle} />
          <p className={style.title}>Fix header on iPhoneX</p>
          <SubscriptionAvatar className={style.avatar} userId={55} />
        </div>

        <div className={style.section}>
          <SubscriptionAvatar className={style.avatar} userId={55} />
          <p className={style.name}>MyDocuments</p>
          <button className={style.all}>See all</button>
        </div>

        <div className={style.task}>
          <div className={style.circle} />
          <p className={style.title}>Fix header on iPhoneX</p>
          <SubscriptionAvatar className={style.avatar} userId={55} />
        </div>

        <div className={style.task}>
          <div className={style.circle} />
          <p className={style.title}>Fix header on iPhoneX</p>
          <SubscriptionAvatar className={style.avatar} userId={55} />
        </div>

        <div className={style.task}>
          <div className={style.circle} />
          <p className={style.title}>Fix header on iPhoneX</p>
          <SubscriptionAvatar className={style.avatar} userId={55} />
        </div>
      </div>
    </div>;
  }
}

export default Tasks;
