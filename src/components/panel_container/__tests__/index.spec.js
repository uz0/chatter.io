import React from 'react';
import { shallow } from 'enzyme';
import { Panel } from '@/components/panel_container';
import data from '@/__tests__/__data__';

describe('Panel component', () => {
  it('renders correctly', () => {
    window.localStorage.setItem('currentUser', JSON.stringify(data.currentUser));

    const wrapper = shallow(<Panel
      t={() => {}}
      details={data.details}
    />);

    expect(wrapper).toMatchSnapshot();
  });
});
