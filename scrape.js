const scrapeIndex = require('./lib/index')
const scrapeReport = require('./lib/report')

const { DEFAULT_INDEX_URL, FIRST_PAGE, urlOfPage } = require('./lib/constants')
/*
 * 1: Parse the default index page at https://muenchen-chronik.de/chronik/
 * 2a: If there is a given 'untilReportURI', scrape the reports from the default page until untilReportURI is reached
 * 2b: otherwise, scrape all reports until the last page
 * 
 * A parameter configures how many HTTP requests can be made at once, 5
 * should be a good default
 * A parameter configures how long to wait between a group of requests
 */

/*
 * Need a queue
 * 
 * 
 */


class RequestsQueue{
  constructor( pageCount, reportsURLs = [], groupSize, groupInterval, stopAtReportURI ){
    this.pageCount = pageCount
    this.currentPage = FIRST_PAGE
    this.reportsURLs = reportsURLs

    this.groupSize = groupSize
    this.groupInterval = groupInterval
    this.requestsGroup = []

    this.stopAtReportURI = stopAtReportURI
    this.done = false
  }

  isDone(){
    return this.done || (this.reportsURLs.length == 0 && this.currentPage == this.pageCount)
  }

  async next(){
    if( this.isDone() ){
      return
    }
    
    if( this.reportsURLs.length == 0 ){ //all the reports of the page have been processed
      //Load next page
      this.currentPage++
      const {reportsURLs} = await scrapeIndex( urlOfPage( this.currentPage ) )
      this.reportsURLs = reportsURLs
      return this.next()
    }

    //Get next batch of requests and remove them from the queue
    let nextBatch = this.reportsURLs
      .splice(0, this.groupSize )

    if( this.stopAtReportURI && nextBatch.includes( this.stopAtReportURI ) ){
      //Only process the reports up until the given URI and we are done!
      const until = nextBatch.indexOf( this.stopAtReportURI )
      nextBatch = nextBatch.splice(0, until)
      this.done = true
    }

    return Promise.all( nextBatch.map( (url) => scrapeReport(url) ) )
      .then( () => {
        if( this.isDone() ){
          return //no need to wait
        }

        //Keep processing the queue after a pause
        setTimeout( () => {
          this.next()
        }, this.groupInterval ) //wait a moment before continuing
      })
  }
}

const scrape = async (options) => {
  //Override defaults with given options
  const opts = Object.assign({
    groupSize: 5,
    groupInterval: 30000, //in ms
    stopAtReportURI: false
  }, options)

  const {reportsURLs, pageCount} = await scrapeIndex( DEFAULT_INDEX_URL )

  const queue = new RequestsQueue( pageCount, reportsURLs, opts.groupSize, opts.groupInterval, opts.stopAtReportURI )
  //Async
  queue.next()
}

module.exports = scrape
