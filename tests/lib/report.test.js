const fs = require('fs')
const request = require('request')
const validateSchema = require('rwv-schema')
const {ReportParserError} = require('../../lib/errors')
const scrapeReport = require('../../lib/report')

const reportJson = require('../samples/report.json')
//Mock HTTP requests
jest.mock('request')

//Use a pre-fetched sample report
const sampleReport = fs.readFileSync('./tests/samples/report.html', 'utf8')
const reportWithoutYear = fs.readFileSync('./tests/samples/report_no_year.html', 'utf8')
request.mockImplementation((...args) => {
  const cb = args.pop()
  cb( null, {statusCode: 200}, sampleReport )
})


test( 'Base test', async () => {
  const result = await scrapeReport( 'https://domain.tld/path/to/page.html' )
  expect( result ).toEqual( reportJson )
})

test( 'Validate against schema', async () => {
  const result = await scrapeReport( 'https://domain.tld/path/to/page.html' )
  expect( validateSchema(result) ).toBeTruthy()
})

test( 'Report parsing error', async (done) => {
  request.mockImplementationOnce((...args) => {
      const cb = args.pop()
      cb( null, {statusCode: 200}, reportWithoutYear )
  })

  try{
    await scrapeReport( 'https://domain.tld/path/to/page.html' )
    done.fail( new Error('Parsing should have failed') )
  }catch(e){
    expect(e).toBeInstanceOf( ReportParserError )
  }
  done()

})
