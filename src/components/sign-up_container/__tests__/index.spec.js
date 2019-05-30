import React from 'react';
import { shallow } from 'enzyme';
import { SignUp } from '@/components/sign-up_container';

describe('SignUp component', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<SignUp
      t={() => {}}
    />);

    expect(wrapper).toMatchSnapshot();
  });
});
