import React, { Component } from 'react';
import compose from 'recompose/compose';
import get from 'lodash/get';
import { connect } from 'react-redux';
import Button from '@/components/button';
import actions from './actions';
import style from './style.css';

export { default as actions } from './actions';
export { default as reducers } from './reducers';

class Gallery extends Component {
  handleDocumentKeyDown = event => {
    if (this.props.images.length > 0) {
      if (event.keyCode === 37) {
        this.left();
      }

      if (event.keyCode === 39) {
        this.right();
      }
    }
  };

  touchstartX = 0;
  touchendX = 0;

  left = event => {
    if (event) {
      event.stopPropagation();
    }

    if (this.props.images[this.props.index - 1]) {
      this.props.step(this.props.index - 1);
    }
  };

  right = event => {
    if (event) {
      event.stopPropagation();
    }

    if (this.props.images[this.props.index + 1]) {
      this.props.step(this.props.index + 1);
    }
  };

  close = event => {
    event.stopPropagation();
    this.props.close();
  }

  preventClose = event => event.stopPropagation();

  preventCloseMobile = event => {
    if (this.props.isMobile) {
      event.stopPropagation();
    }
  };

  onTouchStart = event => {
    event.persist();

    if (this.props.isMobile) {
      const touchobj = event.changedTouches[0];
      this.touchstartX = touchobj.pageX;
    }
  };

  onTouchEnd = event => {
    event.persist();

    if (this.props.isMobile) {
      const touchobj = event.changedTouches[0];
      this.touchendX = touchobj.pageX;
      this.handleSwipe();
    }
  };

  handleSwipe = () => {
    if (this.touchstartX > this.touchendX) {
      this.right();
    }

    if (this.touchstartX < this.touchendX) {
      this.left();
    }
  };

  componentDidMount() {
    window.addEventListener('keydown', this.handleDocumentKeyDown);
  }

  componwntWillUnmount() {
    window.removeEventListener('keydown', this.handleDocumentKeyDown);
  }

  render() {
    const isRightButtonShown = !!this.props.images[this.props.index + 1];
    const isLeftButtonShown = !!this.props.images[this.props.index - 1];

    return this.props.images.length > 0 && <div className={style.gallery} onClick={this.close}>
      {isLeftButtonShown &&
        <Button
          appearance="_icon-transparent"
          icon="thin-arrow-left"
          className={style.arrow_left}
          onClick={this.left}
        />
      }

      {isRightButtonShown &&
        <Button
          appearance="_icon-transparent"
          icon="thin-arrow-right"
          className={style.arrow_right}
          onClick={this.right}
        />
      }

      <div className={style.close_wrapper} onClick={this.preventClose}>
        <Button
          appearance="_icon-transparent"
          icon="close"
          className={style.close}
          onClick={this.close}
        />
      </div>

      <div
        className={style.content}
        onClick={this.preventCloseMobile}
        onTouchStart={this.onTouchStart}
        onTouchEnd={this.onTouchEnd}
      >
        <img src={this.props.images[this.props.index]} onClick={this.preventClose} />
      </div>
    </div>;
  }
}

export default compose(
  connect(
    state => ({
      images: get(state, 'gallery.images', []),
      index: get(state, 'gallery.index', 0),
      isMobile: state.device === 'touch',
    }),

    {
      close: actions.closeGallery,
      step: actions.stepGallery,
    },
  ),
)(Gallery);
