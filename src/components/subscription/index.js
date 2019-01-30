import React, { Component } from 'react';
import { Link } from 'react-router';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

class Subscription extends Component {
  render() {
    return <Link className={cx('subscription', this.props.className)}>
      <div className={style.photo} style={{ '--photo': 'url(/assets/default-user.jpg)' }} />

      <div className={style.content}>
        <p className={style.name}>Person name</p>

        <div className={style.section}>
          <p className={style.text}>Test picture</p>
          <span className={style.time}>09:23</span>
        </div>
      </div>

      {false && <div className={style.point} />}
      {false && <div className={style.last_photo} style={{ '--photo': 'url(/assets/default-user.jpg)' }} />}
      {false && <span className={style.last_count}>+3</span>}
    </Link>;
  }
}

export default Subscription;
