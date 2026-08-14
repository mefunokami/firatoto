import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('pageerror', err => {
    errors.push(`Page Error on ${page.url()}: ${err.message}`);
  });
  
  const baseUrl = 'http://localhost:5173';
  
  const routesToTest = [
    '/',
    '/hakkımızda',
    '/iletisim',
    '/blog',
    '/cikma-parcalar',
    '/brand-category',
    '/cart',
    '/login',
    '/register',
    '/admin-login'
  ];
  
  console.log(`Testing ${routesToTest.length} core routes...`);
  
  for (const route of routesToTest) {
    try {
      console.log(`Visiting: ${baseUrl}${route}`);
      const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle2', timeout: 10000 });
      if (!response.ok()) {
        errors.push(`Failed to load ${route}: HTTP ${response.status()}`);
      } else {
        console.log(`✅ ${route} loaded successfully.`);
      }
    } catch (e) {
      errors.push(`Error navigating to ${route}: ${e.message}`);
    }
  }

  await browser.close();
  
  if (errors.length > 0) {
    console.log('\n❌ Tests failed with errors:');
    errors.forEach(e => console.log(e));
    process.exit(1);
  } else {
    console.log('\n✅ All tested pages loaded successfully without console errors!');
  }
})();
