//NOTE: When morph.io executes the scraper, it sets process.env.NODE_ENV
//to 'production'
const path = require('path')
const getDB = require('rwv-sqlite/lib/db')
const errorTable = require('rwv-sqlite/lib/error')
const InsertStream = require('rwv-sqlite/lib/stream')
const {JSONToString} = require('rwv-sqlite')
const scrape = require('./scrape')

const toStringStream = new JSONToString()

let insert
let source
let dbHandle
//Setup the database
const pipeline = async () => getDB( path.resolve('./config/database.json'), false )
  .then( ({DB, migrations}) => new Promise( (s,f) => {
    dbHandle = DB
    //Get the newest inserted report, if any
    DB.db.get('SELECT uri FROM data ORDER BY createdDate ASC LIMIT 1', (err, row) => {
      if(err){
        f(err)
        return
      }
      insert = new InsertStream({}, DB)
      s( row ? row.uri : false )
    })
  })
  )
  .then( (stopAtReportURI) => scrape({stopAtReportURI}, true) )
  .then( (scraperStream) => {
    source = scraperStream
  })
  .then( () => new Promise( (s,f) => {

    //Catch error from the streams
    source.on('error', f)
    insert.on('error', f)
    //done!
    insert.on('end', () => s('ok') )
    
    try{
      //Start scraping and inserting
      source.pipe(insert)
        .pipe(toStringStream)
        .pipe(process.stdout)
    }catch(e){
       f(e)
    }
  }) )
  .catch( (e) => {
    const reportURI = e.reportURI || 'unknown or non-applicable'
    const pageURL = source.currentPageURL
    const cause = JSON.stringify( e.message )
    //save th error to the database
    return errorTable.insert( reportURI, cause, pageURL, dbHandle )
      .then( () => {
        throw e
      })
  })

module.exports = pipeline
