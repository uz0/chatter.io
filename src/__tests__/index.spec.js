import {resolveBy, select} from 'reselector';

const resolve = resolveBy(require.resolve);
const {SignIn: SignInSelector} = resolve('../components/sign-in_container');

const signInButton = select`${SignInSelector} a[href="/sign-in/"]`;
const signUpButton = select`${SignInSelector} a[href="/sign-up/"]`;

// const url = 'https://demo-chat.universa.io';
const url = 'http://localhost:8080/';

jest.setTimeout(31000);

describe('Google', () => {
  beforeAll(async () => {
    await page.goto('https://google.com')
  })

  it('should display "google" text on page', async () => {
    await expect(page).toMatch('google')
  })
})

describe('Index page', () => {
  beforeAll(async () => {
    await page.goto(url);
    await page.waitForNavigation();
  });

  it('should display "Log In" button in viewport', async () => {
    // await page.waitForSelector(signInButton, {visible: true});
    // expect(button.isIntersectingViewport()).toEqual(true);
    await expect(page).toMatch('Log in');
  });

  it('should display "Sign Up" button in viewport', async () => {
    // await page.waitForSelector(signUpButton, {visible: true});

    await expect(page).toMatch('Sign Up');
  });

  it('should not display "qweqwe." text on page', async () => {

    await expect(page).not.toMatch('qweqwe.');
  });
});
