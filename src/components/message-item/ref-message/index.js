import React, { Component } from 'react';
import get from 'lodash/get';
import classnames from 'classnames/bind';
import { withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import Icon from '@/components/icon';
import Loading from '@/components/loading';
import { api } from '@';
import { actions as messagesActions } from '@/store/messages';
import style from './style.css';

const cx = classnames.bind(style);

class RefMessage extends Component {
  state = {
    isLoading: false,
    hasError: false,
  };

  loadRefMessage = () => {
    this.setState({ isLoading: true });

    api.getMessage({message_id: (this.props.forwardedId || this.props.repliedId)}).then(data => {
      this.setState({ isLoading: false });
      this.props.addMessage({ message: data.message });
    }).catch(() => this.setState({ isLoading: false, hasError: true }));
  };

  componentDidMount() {
    if (!this.props.message) {
      this.loadRefMessage();
    }
  }

  render() {
    const nick = get(this.props, 'user.nick', 'no nick') || 'no nick';
    const isMessageDeleted = this.props.message && this.props.message.deleted_at;
    const isAttachmentImage = get(this.props, 'message.attachment.content_type', '').match('image/');

    return <div className={cx('message', {'_is-forwarded': !!this.props.forwardedId}, this.props.className)}>
      <div className={style.title}>
        <p className={style.name}>{nick}</p>

        <span className={style.type}>
          {', '}
          {this.props.forwardedId && this.props.t('forwarded')}
          {this.props.repliedId && this.props.t('replied')}
        </span>
      </div>

      {this.props.message && !isMessageDeleted &&
        <div className={style.section}>
          {this.props.message.attachment &&
            <div
              className={style.file}
              {...isAttachmentImage ? { style: {'--image': 'url(/assets/default-image.jpg)'} } : {}}
            >
              {!isAttachmentImage &&
                <Icon name="attach" />
              }
            </div>
          }

          {this.props.message.text &&
            <p className={style.text}>{this.props.message.text}</p>
          }
        </div>
      }

      {isMessageDeleted &&
        <p className={style.deleted}>{this.props.t('message_has_been_deleted')}</p>
      }

      {this.state.hasError &&
        <Icon name="warning" />
      }

      <Loading isShown={this.state.isLoading} className={style.loading} />
    </div>;
  }
}

export default compose(
  withNamespaces('translation'),

  connect(
    (state, props) => ({
      ...props.forwardedId ? { message: state.messages.list[props.forwardedId] } : null,
      ...props.repliedId ? { message: state.messages.list[props.repliedId] } : null,
    }),

    {
      addMessage: messagesActions.addMessage,
    },
  ),

  connect(
    (state, props) => ({
      ...props.message ? { user: state.users.list[props.message.user_id] } : null,
    }),
  ),
)(RefMessage);
