import React from 'react';
import { shallow } from 'enzyme';
import { ForgotPassword } from '@/components/forgot-password_container';

describe('ForgotPassword component', () => {
  it('renders correctly', () => {
    const location = {
      query: {},
    };

    const wrapper = shallow(<ForgotPassword
      t={() => {}}
      location={location}
    />);

    expect(wrapper).toMatchSnapshot();
  });
});
