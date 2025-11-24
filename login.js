const fs = require('fs');
const puppeteer = require('puppeteer');

function formatToISO(date) {
  return date.toISOString().replace('T', ' ').replace('Z', '').replace(/\.\d{3}Z/, '');
}

async function delayTime(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  // 读取 accounts.json 中的 JSON 字符串
  try {
    const accountsJson = fs.readFileSync('accounts.json', 'utf-8');
    const accounts = JSON.parse(accountsJson);

    for (const account of accounts) {
      const { username, password, panelnum } = account;

      const browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu'
        ]
      });
      const page = await browser.newPage();

      // 设置视口大小，有时候 headless 模式默认视口太小会导致布局问题
      await page.setViewport({ width: 1280, height: 800 });

      let url = `https://panel${panelnum}.serv00.com/login/?next=/`;

      try {
        console.log(`正在登录账号: ${username}`);
        await page.goto(url, { waitUntil: 'networkidle2' }); // 等待网络空闲，确保页面加载完毕

        // 清空用户名输入框的原有值 (ID 仍然是 id_username)
        const usernameInput = await page.$('#id_username');
        if (usernameInput) {
          await usernameInput.click({ clickCount: 3 });
          await usernameInput.press('Backspace');
        }

        // 输入账号 (ID 仍然是 id_username)
        await page.type('#id_username', username);
        
        // 输入密码 (ID 仍然是 id_password)
        await page.type('#id_password', password);

        // --- 修改开始：定位新的登录按钮 ---
        // 新网页结构中，登录表单有 data-login-form 属性，按钮是 type="submit"
        const loginButton = await page.$('form[data-login-form] button[type="submit"]');
        
        if (loginButton) {
          // 使用 Promise.all 并发执行点击和等待跳转，这比分开写更稳定
          await Promise.all([
            page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
            loginButton.click()
          ]);
        } else {
          throw new Error('无法找到登录按钮 (form[data-login-form] button[type="submit"])');
        }
        // --- 修改结束 ---

        // 判断是否登录成功
        const isLoggedIn = await page.evaluate(() => {
          // 检查是否有退出按钮，这通常意味着已登录
          const logoutButton = document.querySelector('a[href="/logout/"]');
          return logoutButton !== null;
        });

        if (isLoggedIn) {
          const nowUtc = formatToISO(new Date());
          const nowBeijing = formatToISO(new Date(new Date().getTime() + 8 * 60 * 60 * 1000));
          console.log(`账号 ${username} 于北京时间 ${nowBeijing}（UTC时间 ${nowUtc}）登录成功！`);
        } else {
          console.error(`账号 ${username} 登录失败，请检查账号和密码是否正确，或者面板号是否匹配。`);
        }
      } catch (error) {
        console.error(`账号 ${username} 登录时出现错误: ${error}`);
      } finally {
        await page.close();
        await browser.close();

        // 随机延时
        const delay = Math.floor(Math.random() * 8000) + 1000;
        await delayTime(delay);
      }
    }

    console.log('所有账号登录完成！');
  } catch (err) {
    console.error('读取 accounts.json 失败或代码运行错误:', err);
  }
})();
