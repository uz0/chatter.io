import React, { Component } from 'react';
import classnames from 'classnames/bind';
import Button from '@/components/button';
import Icon from '@/components/icon';
import style from './style.css';

const cx = classnames.bind(style);

class Panel extends Component {
  state = {
    collapseActive: 'people',
  };

  toggleCollapse = name => () => this.setState({ collapseActive: this.state.collapseActive === name ? '' : name });

  render() {
    return <div className={cx('panel', this.props.className, { '_is-shown': this.props.isShown })}>
      <Button appearance="_icon-transparent" icon="arrow-left" onClick={this.props.onClose} className={style.close} />

      <div className={style.header}>
        <div className={style.image} style={{ '--image': 'url(/assets/default-user.jpg)' }} />
        <p className={style.name}>Revolution Product</p>
        <p className={style.subcaption}>5 people</p>
      </div>

      <div className={style.scroll}>
        <button className={style.button}>
          <Icon name="share" />
          <span>Copy invite link</span>
        </button>

        <button className={style.button}>
          <Icon name="notification" />
          <span>Notifications</span>
        </button>

        <button className={style.button} style={{ '--icon-size': '18px' }}>
          <Icon name="search" />
          <span>Search in conversation</span>
        </button>

        <button className={style.button} style={{ '--icon-size': '22px' }}>
          <Icon name="folder" />
          <span>Category</span>
        </button>

        <div className={cx('collapse', { '_is-open': this.state.collapseActive === 'people' })}>
          <button className={style.collapse_button} onClick={this.toggleCollapse('people')}>
            <span>People</span>
            <Icon name="arrow-down" />
          </button>

          <div className={style.collapse_list}>
            <div className={style.person}>
              <div className={style.avatar} style={{ '--photo': 'url(/assets/default-user.jpg)' }} />
              <p>Meg Rigden</p>
              <span>Admin</span>
            </div>

            <div className={style.person}>
              <div className={style.avatar} style={{ '--photo': 'url(/assets/default-user.jpg)' }} />
              <p>Meg Rigden</p>
              <span>Admin</span>
            </div>

            <div className={style.person}>
              <div className={style.avatar} style={{ '--photo': 'url(/assets/default-user.jpg)' }} />
              <p>Meg Rigden</p>
              <span>Admin</span>
            </div>

            <div className={style.person}>
              <div className={style.avatar} style={{ '--photo': 'url(/assets/default-user.jpg)' }} />
              <p>Meg Rigden</p>
              <span>Admin</span>
            </div>

            <div className={style.person}>
              <div className={style.avatar} style={{ '--photo': 'url(/assets/default-user.jpg)' }} />
              <p>Meg Rigden</p>
              <span>Admin</span>
            </div>

            <div className={style.person}>
              <div className={style.avatar} style={{ '--photo': 'url(/assets/default-user.jpg)' }} />
              <p>Meg Rigden</p>
              <span>Admin</span>
            </div>
          </div>
        </div>

        <div className={cx('collapse', { '_is-open': this.state.collapseActive === 'extensions' })}>
          <button className={style.collapse_button} onClick={this.toggleCollapse('extensions')}>
            <span>Extensions</span>
            <Icon name="arrow-down" />
          </button>

          <div className={style.collapse_list}>
            Extensions
          </div>
        </div>

        <div className={cx('collapse', { '_is-open': this.state.collapseActive === 'transactions' })}>
          <button className={style.collapse_button} onClick={this.toggleCollapse('transactions')}>
            <span>Transactions</span>
            <Icon name="arrow-down" />
          </button>

          <div className={style.collapse_list}>
            Transactions
          </div>
        </div>

        <div className={cx('collapse', { '_is-open': this.state.collapseActive === 'files' })}>
          <button className={style.collapse_button} onClick={this.toggleCollapse('files')}>
            <span>Files</span>
            <Icon name="arrow-down" />
          </button>

          <div className={style.collapse_list}>
            Files
          </div>
        </div>

        <div className={cx('collapse', { '_is-open': this.state.collapseActive === 'photos' })}>
          <button className={style.collapse_button} onClick={this.toggleCollapse('photos')}>
            <span>Photos</span>
            <Icon name="arrow-down" />
          </button>

          <div className={style.collapse_list}>
            Photos
          </div>
        </div>
      </div>
    </div>;
  }
}

export default Panel;
