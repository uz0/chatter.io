import React from 'react';
import { shallow } from 'enzyme';
import { Layout } from '@/layout';
import style from '@/layout-style.css';
import puppeteer from 'puppeteer';

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

describe('Pupetteer', () => {
  test('Login form works correctly', async () => {
    let browser = await puppeteer.launch({
      headless: false,
    });
    let page = await browser.newPage();

    page.emulate({
      viewport: {
        width: 500,
        height: 2400,
      },
      userAgent: '',
    });

    await page.goto('http://localhost:8080/sign-in');
describe('When the user enters the correct login and password', function() {
   it('should display an username', function(done) {
       browser
           .setValue('#username', 'hoffasha@gmail.com')
           .setValue('#password', 'nastya227')
           .click('#Log in')
           .waitForExist('.user-panel');

       expect(browser.getText('user-panel__placeholder'))
           .toBe('Unichat');

       browser.call(done);
   });
});
  }, 25000);
});