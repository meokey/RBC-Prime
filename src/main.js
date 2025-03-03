// Apify SDK - toolkit for building Apify Actors (Read more at https://docs.apify.com/sdk/js/).
import { Actor } from 'apify';
// Web scraping and browser automation library (Read more at https://crawlee.dev)
import { PuppeteerCrawler, Dataset } from 'crawlee';
// this is ESM project, and as such, it requires you to specify extensions in your relative imports
// read more about this here: https://nodejs.org/docs/latest-v18.x/api/esm.html#mandatory-file-extensions
import { router } from './routes.js';

await Actor.init();

// Check if data has already been updated today
async function checkIfUpdatedToday() {
    try {
        //// Get dataset items - using Actor.getDataset() which handles default dataset properly
        //const defaultDataset = await Actor.openDataset();
        //const { items } = await defaultDataset.getData({
        //    limit: 1,
        //    desc: true, // Get the most recent item first
        //    skipHidden: false,
        //});
	//console.log(`Found ${items.length} items in the default dataset`);
	// Get key-value store RBC
	const RBCStore = await Actor.openKeyValueStore('RBC');
	const lastItem = await RBCStore.getValue('PRIME-RATES');

        console.log(`Found items last updated on ${lastItem.lastUpdated} in the PRIME-RATES of key-value store RBC.`);
        
        // If there's no data, return false to indicate we need to fetch new data
        if (!lastItem || lastItem.length === 0) {
            console.log('No existing data found. Starting crawler...');
            return false;
        }

        //const lastItem = items[0];
        //console.log('Most recent item:', JSON.stringify(lastItem, null, 2));
        
        // Check if lastUpdated exists and is from today
        if (lastItem && lastItem.lastUpdated) {
            const lastUpdateDate = new Date(lastItem.lastUpdated);
            const today = new Date();
            
            // Compare year, month, and day to check if it's the same day
            const isSameDay = 
                lastUpdateDate.getUTCFullYear() === today.getUTCFullYear() &&
                lastUpdateDate.getUTCMonth() === today.getUTCMonth() &&
                lastUpdateDate.getUTCDate() === today.getUTCDate();
            
            if (isSameDay) {
                console.log(`Data already updated today at ${lastItem.lastUpdated}. Using existing data for output.`);
		await Actor.pushData(lastItem);
                return true;
            } else {
                console.log(`Last update was on ${lastItem.lastUpdated}. Starting crawler to get fresh data...`);
                return false;
            }
        } else {
            console.log('Last item has no lastUpdated field:', lastItem);
            return false;
        }
    } catch (error) {
        console.error('Error checking last update:', error.message, error.stack);
        // In case of error, proceed with crawling to be safe
        return false;
    }
}

// Main execution
const isUpdatedToday = await checkIfUpdatedToday();

if (isUpdatedToday) {
    // Data is already updated today, we can exit
    console.log('Using existing dataset for API calls. Exiting actor.');
    await Actor.exit();
} else {
    // Data needs to be updated
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
            console.error(`Page failed. Reason: ${error}`);
            const lastErrorMessage = request.errorMessages[request.errorMessages.length - 1];
            await Actor.fail(`Processing Error: ${lastErrorMessage}`);
        },
    });

    // Run the crawler with the start URLs and wait for it to finish.
    await crawler.run(startUrls);
}

// Gracefully exit the Actor process. It's recommended to quit all Actors with an exit().
await Actor.exit();
