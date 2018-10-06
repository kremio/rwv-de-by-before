const fs = require('fs')
const request = require('request')
const scrapeReport = require('../../lib/report')

const reportJson = require('../samples/report.json')
//Mock HTTP requests
jest.mock('request')





test( 'Base test', async () => {
  //Use a pre-fetched sample report
  const sampleReport = fs.readFileSync('./tests/samples/report.html', 'utf8')
  request.mockImplementation((...args) => {
    const cb = args.pop()
    cb( null, {statusCode: 200}, sampleReport )
  })

  const result = await scrapeReport( 'https://domain.tld/path/to/page.html' )
  expect( result ).toEqual( reportJson )
})
