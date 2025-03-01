// Apify SDK - toolkit for building Apify Actors (Read more at https://docs.apify.com/sdk/js/).
import { Actor } from 'apify';
// Web scraping and browser automation library (Read more at https://crawlee.dev)
import { PuppeteerCrawler } from 'crawlee';
// this is ESM project, and as such, it requires you to specify extensions in your relative imports
// read more about this here: https://nodejs.org/docs/latest-v18.x/api/esm.html#mandatory-file-extensions
import { router } from './routes.js';

await Actor.init();

const startUrls = [{ url: 'https://www.rbcroyalbank.com/rates/prime.html' }];

// Create a proxy configuration that will rotate proxies from Apify Proxy.
const proxyConfiguration = await Actor.createProxyConfiguration();

const crawler = new PuppeteerCrawler({
    headless: true,
    proxyConfiguration,
    requestHandler: router,
    launchContext: {
        launchOptions: {
            args: [
                '--disable-gpu', // Mitigates the "crashing GPU process" issue in Docker containers
                '--no-sandbox', // Mitigates the "sandboxed" process issue in Docker containers
                '--single-process',
            ]
        }
    },
    async failedRequestHandler({ request, error }) {
      log.error(`Page failed. Reason: ${error}`);
      const lastErrorMessage = request.errorMessages[request.errorMessages.length - 1];
      await Actor.fail(`Processing Error: ${lastErrorMessage}`);
    },

});

// Run the crawler with the start URLs and wait for it to finish.
await crawler.run(startUrls);

// Gracefully exit the Actor process. It's recommended to quit all Actors with an exit().
await Actor.exit();
