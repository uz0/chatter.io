import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import map from 'lodash/map';
import filter from 'lodash/filter';
import Modal from '@/components/section-modal';
import Loading from '@/components/loading';
import SubscriptionItem from '@/components/subscription-item';
import Button from '@/components/button';
import Icon from '@/components/icon';
import Navigation from '@/components/navigation';
import { api } from '@';
import { withSortedSubscriptions, withRouter } from '@/hoc';
import { actions as modalActions } from '@/components/modal_container';
import { actions as subscriptionsActions } from '@/store/subscriptions';
import style from './style.css';

class Conversations extends Component {
  state = {
    isLoading: false,
  };

  close = () => this.props.pushUrl('/chat');

  openNewDialog = () => this.props.toggleModal({
    id: 'new-company-dialog-modal',

    options: {
      organization_id: parseInt(this.props.match.params.orgId, 10),
    },
  });

  async componentWillMount() {
    if (this.props.subscriptions_filtered_ids.length === 0) {
      this.setState({ isLoading: true });
      const { subscriptions } = await api.getSubscriptions();
      this.props.loadSubscriptions(subscriptions);
      this.setState({ isLoading: false });
    }
  }

  render() {
    const isSubscriptionsExist = this.props.sorted_subscriptions_ids.length > 0;
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
      {this.state.isLoading &&
        <Loading isShown type="line" className={style.loading} />
      }

      <Navigation actions={links} className={style.navigation} />

      <div className={style.list}>
        <button type="button" className={style.new} onClick={this.openNewDialog}>
          <div className={style.circle}>
            <Icon name="plus" />
          </div>

          <p className={style.text}>New Dialog</p>
        </button>

        {isSubscriptionsExist &&
          this.props.sorted_subscriptions_ids.map(id => <div key={id} className={style.item}>
            <SubscriptionItem id={id} className={style.subscription} />
            <Button appearance="_icon-transparent" icon="delete" type="button" className={style.delete} />
          </div>)
        }
      </div>
    </Modal>;
  }
}

export default compose(
  withRouter,

  connect(
    state => ({
      subscriptions_filtered_ids: state.subscriptions.filtered_ids,
      subscriptions_list: state.subscriptions.list,
    }),

    {
      toggleModal: modalActions.toggleModal,
      loadSubscriptions: subscriptionsActions.loadSubscriptions,
    },
  ),

  withSortedSubscriptions(props => {
    let ids = map(props.subscriptions_filtered_ids, id => props.subscriptions_list[id]);
    ids = filter(ids, item => item.group.organization_id === parseInt(props.match.params.orgId, 10));
    ids = map(ids, 'id');

    return {
      ids,
    };
  }),
)(Conversations);