import React, { Component } from 'react';
import compose from 'recompose/compose';
import Modal from '@/components/modal';
import Navigation from '@/components/navigation';
// import { api } from '@';
import { withRouter } from '@/hoc';
import style from './style.css';

class Conversations extends Component {
  close = () => this.props.pushUrl('/chat');

  componentDidMount() {
    // const id = parseInt(this.props.match.params.orgId, 10);

    // api.getOrganizationSubscriptions({organization_id: id}).then(data => {
    //   console.log(data)
    // });
  }

  render() {
    const id = parseInt(this.props.match.params.orgId, 10);
    const actions = [];

    const links = [
      {text: 'General', to: `/${id}/company-settings/general`},
      {text: 'Users', to: `/${id}/company-settings/users`},
      {text: 'Conversations', to: `/${id}/company-settings/conversations`},
    ];

    return <Modal
      title="Edit company"
      wrapClassName={style.wrapper}
      className={style.modal}
      actions={actions}
      close={this.close}
    >
      <Navigation actions={links} className={style.navigation} />
    </Modal>;
  }
}

export default compose(
  withRouter,
)(Conversations);
