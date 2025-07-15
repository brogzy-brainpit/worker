// const puppeteer = require('puppeteer');

// (async () => {
//   // Launch the browser
//   const browser = await puppeteer.launch({ headless: false });
//   const page = await browser.newPage();

//   // Navigate to Yellow Pages
//   await page.goto('https://www.yellowpages.com/');

//   // Perform a search
//   await page.type('#query', 'jewelers');  // Type the search term
//   await page.click('#search-button');     // Click the search button

//   // Wait for the results to load
//   await page.waitForSelector('.results');
  
//   // Scrape the data
//   const results = await page.evaluate(() => {
//     let businesses = [];
//     let items = document.querySelectorAll('.result');

//     items.forEach(item => {
//       let name = item.querySelector('a.business-name')?.innerText;
//       let address = item.querySelector('.street-address')?.innerText;
//       let phone = item.querySelector('.phones')?.innerText;

//       businesses.push({ name, address, phone });
//     });

//     return businesses;
//   });

//   console.log(results);

//   // Close the browser
//   await browser.close();
// })();
