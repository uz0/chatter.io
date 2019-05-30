import React from 'react';
import { shallow } from 'enzyme';
import { SignIn } from '@/components/sign-in_container';

describe('SignIn component', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<SignIn
      t={() => {}}
    />);

    expect(wrapper).toMatchSnapshot();
  });
});
