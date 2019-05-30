import React from 'react';
import { shallow } from 'enzyme';
import { Layout } from '@/layout';
import style from '@/layout-style.css';

describe('Layout component', () => {
  it('showing error on error added', () => {
    const layout = shallow(<Layout>
      <p>Text</p>
    </Layout>);

    expect(layout.contains(<p>Text</p>)).toEqual(true);
    expect(layout.contains(<h1>Error</h1>)).toEqual(false);

    layout.setProps({
      error: {
        details: 'Error',
      },
    });

    expect(layout.contains(<p id="children-text">Text</p>)).toEqual(false);
    expect(layout.contains(<h1>Error</h1>)).toEqual(true);
  });

  it('error page shows all elements of error', () => {
    const error = {
      request: {
        name: 'login',
        arguments: { auth_token: 'token' },
      },

      details: 'Error',
    };

    const layout = shallow(<Layout error={error} />);
    expect(layout.contains(<h2 className={style.title}>Request</h2>)).toEqual(true);
    expect(layout.contains(<h2 className={style.title}>Details</h2>)).toEqual(true);
  });
});
