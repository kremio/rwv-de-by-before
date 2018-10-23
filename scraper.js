//NOTE: When morph.io executes the scraper, it sets process.env.NODE_ENV
//to 'production'
const path = require('path')
const getDB = require('rwv-sqlite/lib/db')
const InsertStream = require('rwv-sqlite/lib/stream')
//const {launch,JSONToString} = require('rwv-sqlite')
const scrape = require('./scrape')

//Setup the database
getDB( path.resolve('./config/database.json') )
  .then( ({DB, migrations}) => new Promise( (s,f) => {
    //Get the last inserted report, if any
    DB.db.get('SELECT uri FROM data ORDER BY createdDate DESC LIMIT 1', (err, row) => {
      if(err){
        f(err)
        return
      }
      s(DB, row ? row.uri : false)
    })
  })
  ).then( (DB, stopAtReportURI) => {
    //Scrape and insert
    const insertStream = new InsertStream({}, DB)
    scrape({stopAtReportURI}).pipe(insertStream)
  }).catch( (e) => {
    console.error(e)
  })
