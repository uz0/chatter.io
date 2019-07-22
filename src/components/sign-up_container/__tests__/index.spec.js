describe('SignUp component ', () => {
  it('should redirect to chat page after success register', async done => {
    await page.goto('http://localhost:8080/sign-up');
    await page.waitForSelector('#email');
    await page.type('#email', `${Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 7)}@gmail.com`);
    await page.type('#password', '123456');
    await page.type('#confirm-password', '123456');
    await page.$eval('#confirm-password', element => element.blur());
    await page.click('button[type="submit"]');
    await page.waitForSelector('#main-title', { timeout: 4000 });
    done();
  });
});