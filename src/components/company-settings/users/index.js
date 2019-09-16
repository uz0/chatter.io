import React, { Component } from 'react';
import Modal from '@/components/modal';
import Navigation from '@/components/navigation';
import SubscriptionAvatar from '@/components/subscription-avatar';
import Dropdown from '@/components/dropdown';
import Button from '@/components/button';
import style from './style.css';

class Users extends Component {
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

      <div className={style.users}>
        {[1,2,3].map(item => <div key={item} className={style.item}>
          <SubscriptionAvatar userId={55} className={style.avatar} />
          <p className={style.name}>Alexander Borodich</p>
          <p className={style.role}>admin</p>

          <Dropdown
            className={style.dropdown}
            uniqueId={`${item}-user-dropdown`}

            items={[
              {text: 'Delete'},
            ]}
          >
            <Button appearance="_icon-transparent" icon="dots" className={style.button} type="button" />
          </Dropdown>
        </div>)}
      </div>
    </Modal>;
  }
}

export default Users;
