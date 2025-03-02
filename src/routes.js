// Apify SDK - toolkit for building Apify Actors (Read more at https://docs.apify.com/sdk/js/).
import { Actor } from 'apify';
import { Dataset, createPuppeteerRouter } from 'crawlee';

// await Actor.init();

export const router = createPuppeteerRouter();

router.addDefaultHandler(async ({ request, page, enqueueLinks, log }) => {
    	console.log("Handle: Default");
        
        // Wait for the dynamic content to load
        await page.waitForSelector('table');
        // Wait for the rate cell to have text
        await page.waitForFunction(() => {
          const rateCell = document.querySelector('table tbody tr:first-child td:nth-child(2)');
          return rateCell && rateCell.textContent.trim() !== '';
        });
        // Extract the prime rate and date
        const ca_prime_rate = await page.$eval('table tbody tr:nth-child(1) td:nth-child(2)', el => el.textContent.trim());
        const ca_prime_date = await page.$eval('table tbody tr:nth-child(1) td:nth-child(3)', el => el.textContent.trim());
        const ca_deposit_rate = await page.$eval('table tbody tr:nth-child(2) td:nth-child(2)', el => el.textContent.trim());
        const ca_deposit_date = await page.$eval('table tbody tr:nth-child(2) td:nth-child(3)', el => el.textContent.trim());
        const us_prime_rate = await page.$eval('table tbody tr:nth-child(3) td:nth-child(2)', el => el.textContent.trim());
        const us_prime_date = await page.$eval('table tbody tr:nth-child(3) td:nth-child(3)', el => el.textContent.trim());
        const us_base_rate = await page.$eval('table tbody tr:nth-child(4) td:nth-child(2)', el => el.textContent.trim());
        const us_base_date = await page.$eval('table tbody tr:nth-child(4) td:nth-child(3)', el => el.textContent.trim());

        // Prepare the result object
        const result = {
	    Royal_Bank_Prime: {
            	Rate: ca_prime_rate,
            	DateofChange: ca_prime_date, },
	    RBC_CAD_Deposit_Reference_Rate: {
		Rate: ca_deposit_rate,
		DateofChange: ca_deposit_date, },
	    Royal_Bank_US_Prime: {
		Rate: us_prime_rate,
		DateofChange: us_prime_date, },
	    Royal_Bank_US_BASE: {
		Rate: us_base_rate,
		DateofChange: us_base_date, },
            lastUpdated: new Date().toISOString(),
            source: request.url
        };
	log.info(`RBC Prime Rate retrieved successfully: ${result}`);
	//console.log(result);

	// To make the data easily accessible for API calls, push the result to default Dataset
        await Actor.pushData(result);
	log.info(`Data pushed to the default dataset successfully.`);
        // Save data to named key-value store
	const store = await Actor.openKeyValueStore('RBC');
	await store.setValue('PRIME-RATES',result);
	log.info(`Data saved in key-value store RBC successfully: ${result}`);
	// console.log('Data saved in key-value store RBC successfully.');
	// You can also output the data to the Actor's named dataset
	// const dataset = await Actor.openDataset('RBC_PRIME');
	// await dataset.pushData(result);
        // log.info(`Data saved in dataset RBC_PRIME successfully: ${result}`);
	//// console.log('Data saved in dataset RBC_PRIME successfully.');
	return result;

});

// Gracefully exit the Actor process. It's recommended to quit all Actors with an exit().
// await Actor.exit();
