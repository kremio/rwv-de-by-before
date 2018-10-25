const {Readable, Transform, PassThrough} = require('stream')
const scrape = require('../scrape')
const InsertStream = require('rwv-sqlite/lib/stream')

jest.mock('../scrape')
jest.mock('rwv-sqlite/lib/stream')

const getDB = require('rwv-sqlite/lib/db')
const errorTable = require('rwv-sqlite/lib/error')

const {ReportParserError} = require('../lib/errors')
const pipeline = require('../pipeline')

describe( 'Scraper pipeline', () => {

  let db

  beforeEach( async (done) => {
    delete process.env.SCRAPER_START_PAGE
    delete process.env.SCRAPER_START_REPORT

    scrape.mockReset()
    InsertStream.mockReset()
    getDB().then( ({DB, migrations}) =>{
      //Start with a clean database
      migrations.reset( () => migrations.up( done ) )
    })
  })

  afterEach( () => {
    if(db){
      db.close()
      db = undefined
    }
  })

  test( 'Terminate cleanly on successful run', async() => {
    scrape.mockImplementation( () => new Readable({
      read(){
        this.push("a chunk")
        this.push(null) //EOF chunk
      }
      }) )

    InsertStream.mockImplementation( () => PassThrough({}) )

    const result = await pipeline()
    expect( result ).toEqual( 'ok' )
  })

  test( 'Catch and store scraper exception', async (done) => {
    const errorMsg = 'Scraping failed'
    const reportURI = 'protocol://path/ressource0'
    const pageURL = 'https://some/page'
    scrape.mockImplementation( () => Object.assign( new Readable({
      read(){
        this.emit("error", new ReportParserError( new Error(errorMsg), reportURI ) )
        this.push(null) //EOF chunk
      }
      }), { currentPageURL: pageURL } ) )

    InsertStream.mockImplementation( () => PassThrough({}) )

    try{
      await pipeline()
      done.fail( new Error('An error should have been thrown') )
    }catch(e){
      expect( e ).toBeInstanceOf( ReportParserError )
      expect( e.message ).toEqual( errorMsg )
      expect( e.reportURI ).toEqual( reportURI )
    }

    const {DB} = await getDB()
    db = DB

    //Check that the error was stored
    const storedError = await errorTable.get( db )

    expect( storedError.reportURI ).toEqual( reportURI )
    expect( JSON.parse( storedError.cause ) ).toEqual( errorMsg )
    expect( storedError.pageURL ).toEqual( pageURL )
    done()

  })

  test( 'Catch and store db insert exception', async (done) => {

    const errorMsg = 'Insert failed'
    const reportURI = 'protocol://path/ressource1'
    const pageURL = 'https://some/page'


    scrape.mockImplementation( () =>  Object.assign( new Readable({
      read(){
        this.push("a chunk")
        this.push(null) //EOF chunk
      }
    }), { currentPageURL: pageURL } ) )

    InsertStream.mockImplementation( () => Transform({
      transform(chunk, encoding, callback) {
        callback( Object.assign( new Error(errorMsg), {reportURI}) )
      }
    }) )

    try{
      await pipeline()
      done.fail( new Error('An error should have been thrown') )
    }catch(e){
      expect( e ).toBeInstanceOf( Error )
      expect( e.message ).toEqual( errorMsg )
      expect( e.reportURI ).toEqual( reportURI )
    }

    const {DB} = await getDB()
    db = DB

    //Check that the error was stored
    const storedError = await errorTable.get( db )

    expect( storedError.reportURI ).toEqual( reportURI )
    expect( JSON.parse( storedError.cause ) ).toEqual( errorMsg )
    expect( storedError.pageURL ).toEqual( pageURL )
    done()

  })

  test( 'Start from last error page and report', async() => {
    const {DB} = await getDB()
    db = DB

    //Record an error
    const errorReportURI = "errorReportURI"
    const errorPageURL = "errorPageURL"
    await errorTable.insert( errorReportURI, "some error message", errorPageURL, db )

    try{
      await pipeline()
    }catch(e){}

    expect( scrape ).toBeCalledWith( expect.objectContaining({
      startAtPageURL: errorPageURL,
      startAtReportURI: errorReportURI
    }), expect.anything() )

    //errors should have been cleared
    const error = await errorTable.get( db )
    expect( error ).toBeUndefined()

  })

  test( 'Start from last error page (no report uri)', async() => {
    const {DB} = await getDB()
    db = DB

    //Record an error
    const errorReportURI = "NA"
    const errorPageURL = "errorPageURL"
    await errorTable.insert( errorReportURI, "some error message", errorPageURL, db )

    try{
      await pipeline()
    }catch(e){}

    expect( scrape ).toBeCalledWith( expect.objectContaining({
      startAtPageURL: errorPageURL,
      startAtReportURI: false
    }), expect.anything() )

    //errors should have been cleared
    const error = await errorTable.get( db )
    expect( error ).toBeUndefined()
  })

  test( 'Start from given page and report given by environment variables', async() => {
    jest.resetModules()
    process.env.SCRAPER_START_PAGE = "envStartPage"
    process.env.SCRAPER_START_REPORT = "envStartReport"

    const _pipeline = require('../pipeline')
    const _scrape = require('../scrape')
    
    try{
      await _pipeline()
    }catch(e){}

    expect( _scrape ).toBeCalledWith( expect.objectContaining({
      startAtPageURL: process.env.SCRAPER_START_PAGE,
      startAtReportURI: process.env.SCRAPER_START_REPORT
    }), expect.anything() )

  })

  test( 'Parameters passed by env variables have priority over error', async() => {
    jest.resetModules()
    process.env.SCRAPER_START_PAGE = "envStartPage2"
    process.env.SCRAPER_START_REPORT = "envStartReport2"

    const {DB} = await require('rwv-sqlite/lib/db')()
    db = DB

    //Record an error
    const errorReportURI = "NA"
    const errorPageURL = "errorPageURL"
    await errorTable.insert( errorReportURI, "some error message", errorPageURL, db )

    const _pipeline = require('../pipeline')
    const _scrape = require('../scrape')
    
    try{
      await _pipeline()
    }catch(e){}

    expect( _scrape ).toBeCalledWith( expect.objectContaining({
      startAtPageURL: process.env.SCRAPER_START_PAGE,
      startAtReportURI: process.env.SCRAPER_START_REPORT
    }), expect.anything() )
  })
})
