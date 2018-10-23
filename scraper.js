//NOTE: When morph.io executes the scraper, it sets process.env.NODE_ENV
//to 'production'
const path = require('path')
const getDB = require('rwv-sqlite/lib/db')
const InsertStream = require('rwv-sqlite/lib/stream')
const {JSONToString} = require('rwv-sqlite')
const scrape = require('./scrape')

const toStringStream = new JSONToString()

let insert
//Setup the database
getDB( path.resolve('./config/database.json'), false )
  .then( ({DB, migrations}) => new Promise( (s,f) => {
    //Get the last inserted report, if any
    DB.db.get('SELECT uri FROM data ORDER BY createdDate ASC LIMIT 1', (err, row) => {
      if(err){
        f(err)
        return
      }
      insert = new InsertStream({}, DB)
      s( row ? row.uri : false )
    })
  })
  ).then( (stopAtReportURI) => scrape({stopAtReportURI}, true) )
  .then( (source) => {
    try{
    source.pipe(insert)
      .pipe(toStringStream)
      .pipe(process.stdout)
    }catch(e){
      console.log(e)
    }
  }).catch( (e) => {
    console.error(e)
    console.error(e.stack)
  })
