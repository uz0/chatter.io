import React from 'react';
import { shallow } from 'enzyme';
import { Sidebar } from '@/components/sidebar_container';

describe('Sidebar component', () => {
  it('renders correctly', () => {
    const currentUser = {
      auth_token: 'Qli089GxuOrWGAAVYzcVJH1px_lRHO6Wf0Ke_icqf8kpndF0Fz_b02li8',

      avatar: {
        full: 'https://chat.mainnetwork.io/rails/active_storage/b…9eb29647350acdf569189259ae78b83/inline_image.jpeg',
        small: 'https://chat.mainnetwork.io/rails/active_storage/r…e8e3e554111dab5bd87656de36a7063/inline_image.jpeg',
      },

      confirmed_at: '2018-10-16T12:06:32Z',
      email: 'efim1382@gmail.com',
      id: 55,
      is_confirmed: true,
      nick: 'efim1382',
      searchable_nick: true,
    };

    const wrapper = shallow(<Sidebar
      t={() => {}}
      subscriptions_ids={[]}
      sorted_subscriptions_ids={[]}
      currentUser={currentUser}
    />);

    expect(wrapper).toMatchSnapshot();
  });
});
