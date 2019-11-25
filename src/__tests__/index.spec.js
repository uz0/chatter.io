import puppeteer from 'puppeteer';

jest.setTimeout(30000);

const authorize = async (page, login, password) => {
  await page.waitForSelector('input[type="email"]');

  /* когда использую page.$eval('input[type="email"]', el => el.value = 'test@mail.ru') - onInput у инпута не срабатывает */
  await page.focus('input[type="email"]');
  await page.keyboard.type(login);

  await page.focus('input[type="password"]');
  await page.keyboard.type(password);

  await page.click('button[type="submit"]');
  await page.waitForSelector('#project-title');

  const title = await page.$eval('#project-title', el => el.innerHTML);
  await expect(title).toBe('Unichat');
};

describe('Send message', () => {
  it('should display sended message', async (done) => {
    const browser = await puppeteer.launch({
      // headless: false,
      // slowMo: 250,
      // args: ['--start-fullscreen'],
    });

    const page = await browser.newPage();

    await page.setViewport({
      width: 1920,
      height: 900,
      deviceScaleFactor: 1,
    });

    await page.goto('http://localhost:8080');
    await authorize(page, 'test@mail.ru', '123456');
    await page.goto('http://localhost:8080/chat/user/57');

    await page.waitForSelector('#textarea');
    const randomText = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
    await page.focus('#textarea');
    await page.keyboard.type(''); // очищение от драфта
    await page.keyboard.type(randomText);

    await page.click('#send-button');
    await page.click('#sidebar-user-dropdown-button');
    await page.waitForSelector('#logout-button');
    await page.click('#logout-button');

    await authorize(page, 'test2@mail.ru', '123456');
    await page.goto('http://localhost:8080/chat/user/56');
    await page.waitForSelector('#messages-scroll > div[data-message-id]:last-child');
    const message = await page.$eval('#messages-scroll > div[data-message-id]:last-child p', el => el.innerHTML);

    await expect(message).toBe(randomText);
    await browser.close();
    done();
  });
});

