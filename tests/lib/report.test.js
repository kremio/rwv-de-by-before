const specialCases = require('../../special-cases')

jest.mock('../../special-cases', () => ({
  "https://domain.tld/path/to/page_override.html":{
    startDate:( new Date() ).toISOString()
  }
}))

const fs = require('fs')
const request = require('request')
const validateSchema = require('rwv-schema')
const {ReportParserError} = require('../../lib/errors')
const scrapeReport = require('../../lib/report')

const reportJson = require('../samples/report.json')
const tagnamesJson = require('../samples/tagnames.json')
//Mock HTTP requests
jest.mock('request')




//Use a pre-fetched sample report
const sampleReport = fs.readFileSync('./tests/samples/report.html', 'utf8')
const reportWithoutYear = fs.readFileSync('./tests/samples/report_no_year.html', 'utf8')
const reportWithShortDateInSource = fs.readFileSync('./tests/samples/short_date_in_sources.html', 'utf8')
const daysSeparatedWithEm = fs.readFileSync('./tests/samples/daysSeparatedWithEm.html', 'utf8')
const sourceWithMultipleDates = fs.readFileSync('./tests/samples/sourceWithMultipleDates.html', 'utf8')
const anonymousSource =fs.readFileSync('./tests/samples/anonymousSource.html', 'utf8')
const monthOnly = fs.readFileSync('./tests/samples/monthOnly.html', 'utf8')
const yearOnly = fs.readFileSync('./tests/samples/yearOnly.html', 'utf8')
const sourceDateWithDayOfWeek = fs.readFileSync('./tests/samples/sourceDateWithDayOfWeek.html', 'utf8')
const tagsAndSource = fs.readFileSync('./tests/samples/tagnames.html', 'utf8')


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

test( 'Use special cases values', async() => {
  request.mockImplementationOnce((...args) => {
      const cb = args.pop()
      cb( null, {statusCode: 200}, reportWithoutYear )
  })

  const result = await scrapeReport( 'https://domain.tld/path/to/page_override.html' )
  expect( validateSchema(result) ).toBeTruthy()

})

test( 'Parse shortdate notation in source', async() => {
  request.mockImplementationOnce((...args) => {
      const cb = args.pop()
      cb( null, {statusCode: 200}, reportWithShortDateInSource )
  })
  const result = await scrapeReport( 'https://domain.tld/path/to/page.html' )
  expect( validateSchema(result) ).toBeTruthy()
})


test( 'Parse days separated with em', async() => {
  request.mockImplementationOnce((...args) => {
      const cb = args.pop()
      cb( null, {statusCode: 200}, daysSeparatedWithEm )
  })
  const result = await scrapeReport( 'https://domain.tld/path/to/page.html' )
  expect( validateSchema(result) ).toBeTruthy()
})

test( 'Only use last date for source with multiple dates', async() => {
  request.mockImplementationOnce((...args) => {
    const cb = args.pop()
    cb( null, {statusCode: 200}, sourceWithMultipleDates )
  })
  const result = await scrapeReport( 'https://domain.tld/path/to/page.html' )
  expect( validateSchema(result) ).toBeTruthy()
  expect( result.sources[2].publishedDate ).toEqual( '2017-07-30T00:00:00.000+02:00' )
})

test( 'Add anonymous source if none available', async() => {
  request.mockImplementationOnce((...args) => {
    const cb = args.pop()
    cb( null, {statusCode: 200}, anonymousSource )
  })
  const result = await scrapeReport( 'https://domain.tld/path/to/page.html' )
  expect( validateSchema(result) ).toBeTruthy()
  expect( result.sources[0].name ).toEqual('anonymous')
})

test( 'If only the month and year are provided record start date as 1st day of the month, and end date has 1st day of next month', async() => {
  request.mockImplementationOnce((...args) => {
    const cb = args.pop()
    cb( null, {statusCode: 200}, monthOnly )
  })
  const result = await scrapeReport( 'https://domain.tld/path/to/page.html' )
  expect( validateSchema(result) ).toBeTruthy()
  expect( result.startDate ).toEqual( '2016-02-01T00:00:00.000+01:00' )
  expect( result.endDate ).toEqual( '2016-03-01T00:00:00.000+01:00' )
})

test( 'If only the year is provided record start date as 1st january of the year, and end date has 31st december of that year', async() => {
  request.mockImplementationOnce((...args) => {
    const cb = args.pop()
    cb( null, {statusCode: 200}, yearOnly )
  })
  const result = await scrapeReport( 'https://domain.tld/path/to/page.html' )
  expect( validateSchema(result) ).toBeTruthy()
  expect( result.startDate ).toEqual( '2015-01-01T00:00:00.000+01:00' )
  expect( result.endDate ).toEqual( '2015-12-31T00:00:00.000+01:00' )
})

test( 'Parse date starting with day of week', async() => {
  request.mockImplementationOnce((...args) => {
    const cb = args.pop()
    cb( null, {statusCode: 200}, sourceDateWithDayOfWeek )
  })
  const result = await scrapeReport( 'https://domain.tld/path/to/page.html' )
  expect( validateSchema(result) ).toBeTruthy()
  expect( result.sources[1].publishedDate ).toEqual( '2014-12-11T00:00:00.000+01:00' )
})

test( 'Parse tags', async() => {
  request.mockImplementationOnce((...args) => {
    const cb = args.pop()
    cb( null, {statusCode: 200}, tagsAndSource )
  })
  const result = await scrapeReport( 'https://domain.tld/path/to/page.html' )
  expect( result ).toEqual( tagnamesJson )
})
