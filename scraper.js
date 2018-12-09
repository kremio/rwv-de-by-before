//NOTE: When morph.io executes the scraper, it sets process.env.NODE_ENV
//to 'production'
const path = require('path')
const scraperPipeline = require('rwv-scraper-pipeline')
const {urlOfPage, pageNumberOfURL, DEFAULT_INDEX_URL } = require('./lib/constants')

const options = {
  //An async function that scrapes a page of reports index
  scrapeIndex: require('./lib/index'),
  //An async function that scrapes a report
  scrapeReport: require('./lib/report'),
  //Return the URL for the given page number
  urlOfPage,
  //Return the page number for the given page URL
  pageNumberOfURL,
  //The URL to the first page of reports
  startAtPageURL: DEFAULT_INDEX_URL,
  //Path to the database config.json
  pathToDbConfig: path.resolve(__dirname,'./config/database.json')
}

scraperPipeline( options )
  .catch( (e) => {
    console.error(e)
    console.log(e.stack)
    process.kill(1)
})
