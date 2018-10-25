const { Readable } = require('stream')

const scrapeIndex = require('./lib/index')
const scrapeReport = require('./lib/report')

const { DEFAULT_INDEX_URL, FIRST_PAGE, urlOfPage, pageNumberOfURL } = require('./lib/constants')
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
class ReportStream extends Readable{
  constructor(queue){
    //Call the Readable Stream constructor
    super({
      objectMode: true
    })

    this.queue = queue
    this.queue.onData = (data) => {
      return this.push(data)
    }
    this.queue.onEnd = (data) => {
      if(data){
        this.push(data)
      }
      this.push(null)
    }
    this.queue.onError = (error) => {
      this.emit('error', error)
      this.push(null)
    }
  }

  /*
   * Useful to locate where a report makes the scraper choke.
   */
  get currentPageURL(){
    return urlOfPage( this.queue.currentPage )
  }

  /*
   * Implementation of Readable
   * see: https://nodejs.org/api/stream.html#stream_implementing_a_readable_stream
   */
  _read(){
    this.queue.readStart()
  }


}


class RequestsQueue  {
  constructor( pageCount, reportsURLs = [], groupSize, groupInterval, startPageURL, startAtReportURI = false, stopAtReportURI ){
    this.pageCount = pageCount
    this.currentPage = pageNumberOfURL(startPageURL)
    this.initialReportsURLs = reportsURLs
    this._reportsURLs = []
    this.currentReportURL = ''

    this.groupSize = groupSize
    this.groupInterval = groupInterval
    this.requestsGroup = []

    this.startAtReportURI = startAtReportURI
    this.stopAtReportURI = stopAtReportURI
    this.timeout
    this.started = false
    this.done = false

    this.onData = () => true
    this.onEnd = () => {}
    this.onError = (error) => { console.error(error) }
  }

  get reportsURLs(){
    return this._reportsURLs
  }

  set reportsURLs( urls ){
    if( !this.startAtReportURI ){
      this._reportsURLs = urls
      return
    }
    //If the scraper was configured to start at a specific report
    //we need to filter out the other reports
    const findIndex = urls.findIndex( (url) => url == this.startAtReportURI )
    if( findIndex < 0 ){ //could not find the url, it could be in next page
      this._reportsURLs = []
      return
    }
    this.startAtReportURI = false //so we don't waste time filtering again
    this._reportsURLs = urls.slice( findIndex )
  }

  isDone(){
    return this.done || (this.reportsURLs.length == 0 && this.currentPage == this.pageCount)
  }

  readStart(){
    if(!this.started){
      this.started = true
      //Sets the initial reportURLs
      this.reportsURLs = this.initialReportsURLs
      this.next()
    }
  }

  async next(){
    try{
      if( this.timeout ){
        return //wait for the interval between calls to pass
      }

      this.timeout = undefined

      if( this.isDone() ){
        this.onEnd() //done
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

      await Promise.all( nextBatch.map( (url) => scrapeReport(url) ) )
        .then( async (reports) => {
          if( this.isDone() ){
            clearTimeout( this.timeout )
            this.timeout = undefined
            const last = reports.pop()
            reports.every( (report) => this.onData(report) )

            this.onEnd( last ) //done
            return
          }

          //Keep processing the queue after a pause
          this.timeout = setTimeout( () => {
            this.timeout = undefined
            this.next()
          }, this.groupInterval ) //wait a moment before continuing

          const keepGoing = reports.every( (report) => this.onData(report) )

          if( !keepGoing ){
            clearTimeout( this.timeout )
            this.timeout = undefined
            this.onEnd()
            return
          }
        })
    }catch(e){
      this.onError(e)
    }
  }
}

const scrape = async (options, verbose = false) => {
  //Override defaults with given options
  const opts = Object.assign({
    groupSize: 5,
    groupInterval: 30000, //in ms
    stopAtReportURI: false,
    startAtReportURI: false,
    startAtPageURL: DEFAULT_INDEX_URL
  }, options)

  if(verbose){
    console.log("## Scraper setup:", opts)
  }



  const {reportsURLs, pageCount} = await scrapeIndex( opts.startAtPageURL )

  const queue = new RequestsQueue( pageCount, reportsURLs, opts.groupSize, opts.groupInterval, opts.startAtPageURL, opts.startAtReportURI, opts.stopAtReportURI )
  return new ReportStream(queue)
}

module.exports = scrape
