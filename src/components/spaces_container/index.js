import React, { Component } from 'react';
import classnames from 'classnames/bind';
import Avatar from '@/components/avatar';
import Button from '@/components/button';
import style from './style.css';

const cx = classnames.bind(style);

class Spaces extends Component {
  render() {
    return <div className={cx('spaces', this.props.className)}>
      <h3 className={style.title}>#design</h3>
      <p className={style.subtitle}>Public space</p>

      <div className={style.input_container}>
        <Avatar className={style.avatar} photo="/assets/default-user.jpg" />
        <input placeholder="Post to #design" className={style.input} />
        <Button appearance="_fab-divider" icon="plus" className={style.action} />
      </div>

      <div className={style.post}>
        <div className={style.header}>
          <Avatar className={style.avatar} photo="/assets/default-user.jpg" />
          <p className={style.name}>Tokunaga Yae</p>
          <p className={style.caption}>15m ago</p>
          <Button appearance="_icon-transparent" icon="dots" className={style.action} />
        </div>

        <div className={style.content}>
          <p className={style.text}>This feature is contextually sensitive and will convert "words" of numbers separated by forward slash into proper fractions. This feature is dynamic and allows for any fractions. Note that the digits used for fractions are custom-made for their small size, and are even made separately from the slightly larger Superscript and Subscript numbers</p>
        </div>

        <div className={style.footer}>
          <input placeholder="Reply" className={style.reply_input} />
          <Button appearance="_icon-transparent" icon="plus" className={style.action} />
        </div>
      </div>

      <div className={style.post}>
        <div className={style.header}>
          <Avatar className={style.avatar} photo="/assets/default-user.jpg" />
          <p className={style.name}>Tokunaga Yae</p>
          <p className={style.caption}>15m ago</p>
          <Button appearance="_icon-transparent" icon="dots" className={style.action} />
        </div>

        <div className={style.content}>
          <p className={style.text}>This feature is contextually sensitive and will convert "words" of numbers separated by forward slash into proper fractions. This feature is dynamic and allows for any fractions. Note that the digits used for fractions are custom-made for their small size, and are even made separately from the slightly larger Superscript and Subscript numbers</p>
        </div>

        <div className={style.footer}>
          <input placeholder="Reply" className={style.reply_input} />
          <Button appearance="_icon-transparent" icon="plus" className={style.action} />
        </div>
      </div>

      <div className={style.post}>
        <div className={style.header}>
          <Avatar className={style.avatar} photo="/assets/default-user.jpg" />
          <p className={style.name}>Tokunaga Yae</p>
          <p className={style.caption}>15m ago</p>
          <Button appearance="_icon-transparent" icon="dots" className={style.action} />
        </div>

        <div className={style.content}>
          <p className={style.text}>This feature is contextually sensitive and will convert "words" of numbers separated by forward slash into proper fractions. This feature is dynamic and allows for any fractions. Note that the digits used for fractions are custom-made for their small size, and are even made separately from the slightly larger Superscript and Subscript numbers</p>
        </div>

        <div className={style.footer}>
          <input placeholder="Reply" className={style.reply_input} />
          <Button appearance="_icon-transparent" icon="plus" className={style.action} />
        </div>
      </div>

      <div className={style.post}>
        <div className={style.header}>
          <Avatar className={style.avatar} photo="/assets/default-user.jpg" />
          <p className={style.name}>Tokunaga Yae</p>
          <p className={style.caption}>15m ago</p>
          <Button appearance="_icon-transparent" icon="dots" className={style.action} />
        </div>

        <div className={style.content}>
          <p className={style.text}>This feature is contextually sensitive and will convert "words" of numbers separated by forward slash into proper fractions. This feature is dynamic and allows for any fractions. Note that the digits used for fractions are custom-made for their small size, and are even made separately from the slightly larger Superscript and Subscript numbers</p>
        </div>

        <div className={style.footer}>
          <input placeholder="Reply" className={style.reply_input} />
          <Button appearance="_icon-transparent" icon="plus" className={style.action} />
        </div>
      </div>

      <div className={style.post}>
        <div className={style.header}>
          <Avatar className={style.avatar} photo="/assets/default-user.jpg" />
          <p className={style.name}>Tokunaga Yae</p>
          <p className={style.caption}>15m ago</p>
          <Button appearance="_icon-transparent" icon="dots" className={style.action} />
        </div>

        <div className={style.content}>
          <p className={style.text}>This feature is contextually sensitive and will convert "words" of numbers separated by forward slash into proper fractions. This feature is dynamic and allows for any fractions. Note that the digits used for fractions are custom-made for their small size, and are even made separately from the slightly larger Superscript and Subscript numbers</p>
        </div>

        <div className={style.footer}>
          <input placeholder="Reply" className={style.reply_input} />
          <Button appearance="_icon-transparent" icon="plus" className={style.action} />
        </div>
      </div>
    </div>;
  }
}

export default Spaces;
