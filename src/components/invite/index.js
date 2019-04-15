import { Component } from 'react';
import { connect } from 'react-redux';
import { api } from '@';

class Invite extends Component {
  componentWillMount() {
    if (!this.props.currentUser) {
      if (this.props.params.code) {
        this.props.router.push(`/sign-in/${this.props.params.code}`);
      }

      if (this.props.params.nick) {
        this.props.router.push(`/sign-in/user/${this.props.params.nick}`);
      }

      return;
    }

    if (this.props.params.code) {
      api.useInviteCode({ code: this.props.params.code }).then(data => {
        this.props.router.push(`/chat/${data.subscription.id}`);
      });
    }

    if (this.props.params.nick && this.props.params.nick !== this.props.currentUser.nick) {
      api.addContact({nick: this.props.params.nick}).then(data => {
        api.getPrivateSubscription({user_id: data.contact.user.id}).then(() => {
          this.props.router.push(`/chat/user/${data.contact.user.id}`);
        });
      });
    }
  }

  render() {
    return null;
  }
}

export default connect(
  state => ({
    currentUser: state.currentUser,
  }),
)(Invite);
