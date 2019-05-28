import React from 'react';
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import { mount, shallow } from 'enzyme';
import Layout from '@/layout';

const mockStore = configureMockStore();
const emptyStore = mockStore({});

const storeWithError = mockStore({
  error: {
    request: {
      name: 'Request name',
    },

    details: 'Error',
  },
});

describe('Layout component', () => {
  it('should display error page', () => {
    const layout = mount(<Provider store={storeWithError}>
      <Layout />
    </Provider>);

    expect(layout.exists(<h1>Error</h1>));
  });

  it('shouldn`t display error page', () => {
    const layout = mount(<Provider store={emptyStore}>
      <Layout />
    </Provider>);

    expect(!layout.exists(<h1>Error</h1>));
  });
});




// import {resolveBy, select} from 'reselector';

// const resolve = resolveBy(require.resolve);
// const {SignIn: SignInSelector} = resolve('../components/sign-in_container');

// const signInButton = select`${SignInSelector} a[href="/sign-in/"]`;
// const signUpButton = select`${SignInSelector} a[href="/sign-up/"]`;

// // const url = 'https://demo-chat.universa.io';
// const url = 'http://localhost:8080/';

// jest.setTimeout(31000);

// describe('Index page', () => {
//   beforeAll(async () => {
//     await page.goto(url);
//     await page.waitForNavigation();
//   });

//   it('should display "Log In" button in viewport', async () => {
//     await page.waitForSelector(signInButton, {visible: true});
//     // expect(button.isIntersectingViewport()).toEqual(true);
//     await expect(page).toMatch('Log in');
//   });

//   it('should display "Sign Up" button in viewport', async () => {
//     await page.waitForSelector(signUpButton, {visible: true});

//     await expect(page).toMatch('Sign Up');
//   });

//   it('should not display "qweqwe." text on page', async () => {

//     await expect(page).not.toMatch('qweqwe.');
//   });
// });


// react-puppeteer free way

// import puppeteer from 'puppeteer';
//
// let page;
// let browser;
// const width = 1920;
// const height = 1080;
// const APP = "http://0.0.0.0:8080";
//
// beforeAll(async () => {
//   browser = await puppeteer.launch({
//     headless: false,
//     slowMo: 80,
//     args: [`--window-size=${width},${height}`],
//   });
//   page = await browser.newPage();
//   await page.setViewport({ width, height });
// });
//
// describe("qwe", () => {
//   test("qwe", async () => {
//     await page.goto(APP);
//     await expect(page).toMatch('Sign Upqwe');
//   }, 16000);
// });
//
// afterAll(() => {
//   browser.close();
// });
