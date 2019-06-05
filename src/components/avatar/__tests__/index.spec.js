import React from 'react';
import { shallow } from 'enzyme';
import { Avatar } from '@/components/avatar';

describe('component avatar', () => {
  it('2+3=5', () => {
    expect(2+3).toEqual(5);
  });

  it('should renderer correctly', () => {
    const wrapper = shallow(<Avatar />);
    expect(wrapper).toMatchSnapshot();
  });
});