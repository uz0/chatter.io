import React from 'react';
import { shallow } from 'enzyme';
import { Messages } from '@/components/messages_container';
import data from '@/__tests__/__data__';

describe('Messages component', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<Messages
      t={() => {}}
      setError={() => {}}
      params={{}}
      currentUser={data.currentUser}
      details={data.details}
      isGalleryOpen={false}
      subscriptions_ids={[]}
    />);

    expect(wrapper).toMatchSnapshot();
  });
});
