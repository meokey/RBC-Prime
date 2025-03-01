# RBC Prime Rates Scraper

## Introduction

This Apify Actor is designed to retrieve the current Royal Bank Prime and other rates and the date of change from the RBC website and store them in the Apify key-value store.

## How it Works

The Actor uses Crawlee, Puppeteer, and Chrome headless to:

1. Navigate to [https://www.rbcroyalbank.com/rates/prime.html](https://www.rbcroyalbank.com/rates/prime.html).

2. Wait for the page to fully load and the dynamic content to be present.

3. Extract the rates and date of change from the table on the page.

4. Store the extracted values in the Apify key-value store with keys 'Rate' and 'DateofChange'.
example data in JSON:
```json
{
  "Royal_Bank_Prime": {
    "Rate": "5.200",
    "DateofChange": "2025/01/30"
  },
  "RBC_CAD_Deposit_Reference_Rate": {
    "Rate": "3.550",
    "DateofChange": "2025/02/07"
  },
  "Royal_Bank_US_Prime": {
    "Rate": "7.500",
    "DateofChange": "2024/12/19"
  },
  "Royal_Bank_US_BASE": {
    "Rate": "8.000",
    "DateofChange": "2024/12/19"
  },
  "lastUpdated": "2025-03-01T22:20:57.111Z",
  "source": "https://www.rbcroyalbank.com/rates/prime.html"
```

To handle the dynamic nature of the webpage, the Actor waits for the rate cell to have content before extracting it.

## Dependencies

- Apify platform

- Crawlee

- Puppeteer

- Chrome headless

## Usage

1. Log in to your Apify account.

2. Create a new Actor and upload the provided code (main.js and routers.js).

3. Run the Actor. The data will be stored in the key-value store.

4. Access the stored data using the Apify API or the web interface.

For more information on accessing the key-value store, see [Apify Key-Value Store](https://docs.apify.com/actor/storage).

To keep the data up to date, you can set the Actor to run on a schedule. For more information, see [Apify Actor Schedules](https://docs.apify.com/actor/schedules).

Note: This code is designed to be run on the Apify platform. It may not work as-is in a local environment due to dependencies on Apify's infrastructure.

## Troubleshooting

- Ensure that the selectors used to extract the data are still valid, as the webpage structure may change over time.

- If the data is not being extracted correctly, check the page source to verify the selectors.

- Make sure that the Actor has the necessary permissions and that the Apify environment is set up correctly.

- The selectors used in the code assume that the rate is in the second `td` and the date in the third `td` of the first `tr` within the table. If the table structure changes, these selectors may need to be updated.

## Code Structure

- **main.js**: Initializes the Apify Actor and sets up the PuppeteerCrawler to use the request handler from routers.js.

- **routers.js**: Contains the function to handle the request, navigate to the URL, wait for the page to load, extract the data, and store it in the key-value store.

## License

MIT

## Contact

For any questions or support, please [contact me@github](https://github.com/meokey).

## Last Updated

March 1, 2025
