import { Component } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import { withRouter } from '@/hoc';

class Invite extends Component {
  componentWillMount() {
    if (this.props.match.params.code) {
      this.props.pushUrl('/chat', {invitecode: this.props.match.params.code});
    }

    if (this.props.match.params.nick) {
      this.props.pushUrl('/chat', {inviteuser: this.props.match.params.nick});
    }
  }

  render() {
    return null;
  }
}

export default compose(
  withRouter,

  connect(
    state => ({
      currentUser: state.currentUser,
    }),
  ),
)(Invite);
