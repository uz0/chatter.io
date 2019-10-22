import React from 'react';
import style from './style.css';
import classnames from 'classnames/bind';
import { ReactSvgInjector } from "react-svg-injector";

import searchIcon from '@/assets/icons/search.svg';
import addChatIcon from '@/assets/icons/add-chat.svg';
import arrowIcon from '@/assets/icons/arrow.svg';
import shareIcon from '@/assets/icons/share.svg';
import folderIcon from '@/assets/icons/folder.svg';
import muteIcon from '@/assets/icons/mute.svg';
import unmuteIcon from '@/assets/icons/unmute.svg';
import attachIcon from '@/assets/icons/attach.svg';
import closeIcon from '@/assets/icons/close.svg';
import replyIcon from '@/assets/icons/reply.svg';
import dotsIcon from '@/assets/icons/dots.svg';
import warningIcon from '@/assets/icons/warning.svg';
import editIcon from '@/assets/icons/edit.svg';
import deleteIcon from '@/assets/icons/delete.svg';
import forwardIcon from '@/assets/icons/forward.svg';
import markIcon from '@/assets/icons/mark.svg';
import leaveIcon from '@/assets/icons/leave.svg';
import fullScreenIcon from '@/assets/icons/full-screen.svg';
import thinArrowLeftIcon from '@/assets/icons/thin-arrow-left.svg';
import thinArrowRightIcon from '@/assets/icons/thin-arrow-right.svg';
import exclamationIcon from '@/assets/icons/exclamation.svg';
import infoIcon from '@/assets/icons/info.svg';
import fileIcon from '@/assets/icons/file.svg';
import atIcon from '@/assets/icons/at.svg';
import hashtagIcon from '@/assets/icons/hashtag.svg';
import plusIcon from '@/assets/icons/plus.svg';
import menuIcon from '@/assets/icons/menu.svg';
import fourShapesIcon from '@/assets/icons/four-shapes.svg';
import MicrophoneIcon from '@/assets/icons/microphone.svg';
import StopIcon from '@/assets/icons/stop.svg';
import SendIcon from '@/assets/icons/send.svg';
import playIcon from '@/assets/icons/play.svg';
import personIcon from '@/assets/icons/person.svg';
import imageIcon from '@/assets/icons/image.svg';
import dotsListIcon from '@/assets/icons/dots-list.svg';

const cx = classnames.bind(style);

const Icon = ({ name, className }) => <i className={cx('icon', className)}>
  {name === 'search' &&
    <ReactSvgInjector src={searchIcon} />
  }

  {name === 'add-chat' &&
    <ReactSvgInjector src={addChatIcon} />
  }

  {name === 'arrow-left' &&
    <ReactSvgInjector src={arrowIcon} className={style.arrow_left} />
  }

  {name === 'arrow-down' &&
    <ReactSvgInjector src={arrowIcon} className={style.arrow_down} />
  }

  {name === 'arrow-right' &&
    <ReactSvgInjector src={arrowIcon} />
  }

  {name === 'thin-arrow-left' &&
    <ReactSvgInjector src={thinArrowLeftIcon} />
  }

  {name === 'thin-arrow-right' &&
    <ReactSvgInjector src={thinArrowRightIcon} />
  }

  {name === 'share' &&
    <ReactSvgInjector src={shareIcon} />
  }

  {name === 'folder' &&
    <ReactSvgInjector src={folderIcon} />
  }

  {name === 'mute' &&
    <ReactSvgInjector src={muteIcon} />
  }

  {name === 'unmute' &&
    <ReactSvgInjector src={unmuteIcon} />
  }

  {name === 'attach' &&
    <ReactSvgInjector src={attachIcon} className={style.stroke} />
  }

  {name === 'close' &&
    <ReactSvgInjector src={closeIcon} />
  }

  {name === 'reply' &&
    <ReactSvgInjector src={replyIcon} />
  }

  {name === 'dots' &&
    <ReactSvgInjector src={dotsIcon} />
  }

  {name === 'warning' &&
    <ReactSvgInjector src={warningIcon} />
  }

  {name === 'edit' &&
    <ReactSvgInjector src={editIcon} />
  }

  {name === 'forward' &&
    <ReactSvgInjector src={forwardIcon} />
  }

  {name === 'delete' &&
    <ReactSvgInjector src={deleteIcon} />
  }

  {name === 'mark' &&
    <ReactSvgInjector src={markIcon} />
  }

  {name === 'leave' &&
    <ReactSvgInjector src={leaveIcon} />
  }

  {name === 'full-screen' &&
    <ReactSvgInjector src={fullScreenIcon} />
  }

  {name === 'info' &&
    <ReactSvgInjector src={infoIcon} />
  }

  {name === 'exclamation' &&
    <ReactSvgInjector src={exclamationIcon} />
  }

  {name === 'file' &&
    <ReactSvgInjector src={fileIcon} />
  }

  {name === 'hashtag' &&
    <ReactSvgInjector src={hashtagIcon} />
  }

  {name === 'plus' &&
    <ReactSvgInjector src={plusIcon} />
  }

  {name === 'at' &&
    <ReactSvgInjector src={atIcon} />
  }

  {name === 'menu' &&
    <ReactSvgInjector src={menuIcon} />
  }

  {name === 'four-shapes' &&
    <ReactSvgInjector src={fourShapesIcon} />
  }

  {name === 'microphone' &&
    <ReactSvgInjector src={MicrophoneIcon} />
  }

  {name === 'stop' &&
    <ReactSvgInjector src={StopIcon} />
  }

  {name === 'send' &&
    <ReactSvgInjector src={SendIcon} />
  }

  {name === 'play' &&
    <ReactSvgInjector src={playIcon} />
  }

  {name === 'person' &&
    <ReactSvgInjector src={personIcon} />
  }

  {name === 'image' &&
    <ReactSvgInjector src={imageIcon} />
  }

  {name === 'dots-list' &&
    <ReactSvgInjector src={dotsListIcon} />
  }
</i>;

export default Icon;
