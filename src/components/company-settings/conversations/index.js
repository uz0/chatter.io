import React, { Component } from 'react';
import Modal from '@/components/modal';
import Navigation from '@/components/navigation';
// import { api } from '@';
import style from './style.css';

class Conversations extends Component {
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
    >
      <Navigation actions={links} className={style.navigation} />
    </Modal>;
  }
}

export default Conversations;
