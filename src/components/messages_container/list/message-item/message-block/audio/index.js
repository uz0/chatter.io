import React, { Component } from 'react';
import Icon from '@/components/icon';
import classnames from 'classnames/bind';
import style from './style.css';

const cx = classnames.bind(style);

class AudioItem extends Component {
  playAudio = () => {
    if (!this.player) {
      return;
    }

    this.player.play();
    this.props.onChange(this.props.file.url);
    this.player.addEventListener('ended', () => this.props.onChange(null));
  };

  stopAudio = () => {
    if (!this.player) {
      return;
    }

    this.player.pause();
    this.props.onChange(null);
  };

  getCurrentDuration = () => {
    if (!this.player) {
      return;
    }

    if (!this.player.duration) {
      return;
    }

    const duration = this.formatTime(this.player.duration.toFixed(0));

    if (this.player.currentTime === 0) {
      return duration;
    }

    const current = this.formatTime(this.player.currentTime.toFixed(0));
    return `${current} / ${duration}`;
  };

  formatTime = seconds => {
    const hr = Math.floor(seconds / 3600);
    const min = Math.floor((seconds % 3600) / 60);
    const sec = seconds % 60;

    return [hr, min > 9 ? min : hr ? '0' + min : min || '0', sec > 9 ? sec : '0' + sec].filter(a => a).join(':');
  };

  componentDidMount() {
    this.player = new Audio(this.props.file.url);
    this.player.onloadedmetadata = () => this.forceUpdate();
    this.player.ontimeupdate = () => this.forceUpdate();
  }

  render() {
    const duration = this.getCurrentDuration();

    return <div className={cx('audio', this.props.className)}>
      {!this.props.isPlayed &&
        <button className={style.button} onClick={this.playAudio}>
          <Icon name="play" />
        </button>
      }

      {this.props.isPlayed &&
        <button className={style.button} onClick={this.stopAudio}>
          <Icon name="stop" />
        </button>
      }

      <div className={style.audio_content}>
        <p className={style.title}>Audio</p>

        {duration &&
          <p className={style.time}>{duration}</p>
        }
      </div>
    </div>;
  }
}

export default AudioItem;
