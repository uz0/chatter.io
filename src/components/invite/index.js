import { Component } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import { api } from '@';
import { withRouter } from '@/hoc';

class Invite extends Component {
  componentWillMount() {
    if (this.props.params.code) {
      this.props.pushUrl('/chat', {invitecode: this.props.params.code});
    }

    if (this.props.params.nick) {
      this.props.pushUrl('/chat', {inviteuser: this.props.params.nick});
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
