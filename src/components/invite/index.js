import { Component } from 'react';
import { connect } from 'react-redux';
import { api } from '@';

class Invite extends Component {
  componentWillMount() {
    if (this.props.currentUser) {
      api.useInviteCode({ code: this.props.params.code }).then(data => {
        this.props.router.push(`/chat/${data.subscription.id}`);
      });

      return;
    }

    this.props.router.push(`/sign-in/${this.props.params.code}`);
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
