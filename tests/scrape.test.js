//const fs = require('fs')
const scrapeIndex = require('../lib/index')
const scrapeReport = require('../lib/report')
const scrape = require('../scrape')

const { DEFAULT_INDEX_URL, FIRST_PAGE, urlOfPage } = require('../lib/constants')
//const reportJson = require('../samples/report.json')
//Mock HTTP requests
jest.mock('../lib/index')
jest.mock('../lib/report')

//Lets us control timers
jest.useFakeTimers()

describe('Scraper stream', () => {

  beforeEach(() => {
    setTimeout.mockClear()
    scrapeIndex.mockReset()
    scrapeReport.mockReset()
  })

  test( 'No URLs, one page', async (done) => {

    scrapeIndex.mockImplementationOnce(() => ({
      reportURLs: [],
      pageCount: 1
    }))

    const reportStream = await scrape()
    expect( scrapeIndex ).toHaveBeenCalledTimes(1)

    reportStream.resume()//pipe( process.stdout )
    reportStream.on('end', () => {
      expect( scrapeReport ).not.toHaveBeenCalled()
      done()
    })

  })

  test( 'Wait between requests groups', async (done) => {

    scrapeIndex.mockImplementation(() => ({
      reportsURLs: [1,2,3,4,5],
      pageCount: 1
    }))

    let c = 0
    const longWait = 999999
    const reportStream = await scrape( { groupSize: 2, groupInterval: longWait } )

    reportStream.on('data', async(chunk) => {
      if( c % 2 == 0 ){
        jest.runOnlyPendingTimers()
      }
    })
    
    reportStream.on('error', (err) => {
      throw err
    })

    reportStream.on('end', () => {
      expect( setTimeout ).toHaveBeenCalledTimes(2)
      expect( setTimeout ).toHaveBeenLastCalledWith(expect.any(Function), longWait)
      expect( scrapeIndex ).toHaveBeenCalledTimes(1)
      expect( scrapeReport ).toHaveBeenCalledTimes(5)
      expect( scrapeReport ).toHaveBeenCalledWith( 1 )
      expect( scrapeReport ).toHaveBeenCalledWith( 2 )
      expect( scrapeReport ).toHaveBeenCalledWith( 3 )
      expect( scrapeReport ).toHaveBeenCalledWith( 4 )
      expect( scrapeReport ).toHaveBeenCalledWith( 5 )
      done()
    })

  })
  
  test( 'Scrape all pages', async (done) => {
    scrapeIndex.mockImplementationOnce(() => ({ //page 1
      reportsURLs: [1],
      pageCount: 3
    })).mockImplementationOnce(() => ({ //page 2
      reportsURLs: [2,3],
    })).mockImplementationOnce(() => ({ //page 3
      reportsURLs: [4,5],
    }))

    const reportStream = await scrape( { groupSize: 2, groupInterval: 1000 } )

    let c = 0
    reportStream.on('data', async(chunk) => {
      c++
      switch( c ){
        case 1:
          expect( scrapeReport ).toHaveBeenCalledTimes(1)
          jest.runOnlyPendingTimers()
          break
        case 3:
          expect( scrapeIndex ).toHaveBeenCalledTimes(2)
          jest.runOnlyPendingTimers()
          break
        case 4: expect( scrapeIndex ).toHaveBeenCalledTimes(3)
          break
        default:
      }
    })

    reportStream.on('end', () => {
      expect( scrapeIndex ).toHaveBeenCalledTimes(3)
      expect( scrapeReport ).toHaveBeenCalledTimes(5)
      done()
    })

  })

  test( 'Use correct page URLs', async (done) => {
    scrapeIndex.mockImplementationOnce(() => ({ //page 1
      reportsURLs: [1],
      pageCount: 3
    })).mockImplementationOnce(() => ({ //page 2
      reportsURLs: [2,3],
    })).mockImplementationOnce(() => ({ //page 3
      reportsURLs: [4,5],
    }))

    const reportStream = await scrape( { groupSize: 2, groupInterval: 1 } )

    let c = 0
    reportStream.on('data', async(chunk) => {
      ++c
      switch( c ){
        case 1:
          jest.runOnlyPendingTimers()
          break
        case 3:
          jest.runOnlyPendingTimers()
          break
        default:
      }
    })

    reportStream.on('end', () => {
      expect( scrapeIndex ).toHaveBeenCalledTimes(3)
      expect( scrapeIndex ).toHaveBeenCalledWith( DEFAULT_INDEX_URL )
      expect( scrapeIndex ).toHaveBeenCalledWith( urlOfPage(2) )
      expect( scrapeIndex ).toHaveBeenCalledWith( urlOfPage(3) )
      done()
    })

  })
  
  test( 'Stop scraping at given report URI (excluded)', async (done) => {
    scrapeIndex.mockImplementationOnce(() => ({ //page 1
      reportsURLs: [1],
      pageCount: 3
    })).mockImplementationOnce(() => ({ //page 2
      reportsURLs: [2,3],
    })).mockImplementationOnce(() => ({ //page 3
      reportsURLs: [4,5],
    }))

    const reportStream = await scrape( { groupSize: 2, groupInterval: 1, stopAtReportURI: 3  } )


    let c = 0
    reportStream.on('data', async(chunk) => {
      expect( scrapeReport ).toHaveBeenCalledTimes(++c)

      switch( c ){
        case 1:
          jest.runOnlyPendingTimers()
          break
        case 3:
          throw new Error("Went beyond the given report.")
          break
        default:
      }
    })

    reportStream.on('end', () => {
      expect( scrapeIndex ).toHaveBeenCalledTimes(2)
      expect( scrapeReport ).toHaveBeenCalledTimes(2)
      expect( scrapeReport ).toHaveBeenCalledWith( 1 )
      expect( scrapeReport ).toHaveBeenCalledWith( 2 )
      done()
    })

  })

  test( 'Outputs the reports', async(done) => {
    scrapeIndex.mockImplementationOnce(() => ({ //page 1
      reportsURLs: [1,2],
      pageCount: 2
    })).mockImplementationOnce(() => ({ //page 2
      reportsURLs: [3],
    }))

    const reportStream = await scrape( { groupSize: 2, groupInterval: 1 } )
    
    let c = 1
    scrapeReport.mockImplementation((d) => d)
    const chunks = []
    reportStream.on('data', async(chunk) => {
      expect( chunk ).toEqual(c)
      chunks.push( chunk )
      c++
      switch( chunk ){
        case 2:
          jest.runOnlyPendingTimers()
          break
          default:
      }
    })

    reportStream.on('end', () => {
      expect( chunks ).toEqual( [1,2,3] )
      done()
    })

  })

  test( 'Nothing to scrape', async (done) => {
    scrapeIndex.mockImplementationOnce(() => ({ //page 1
      reportsURLs: [1],
      pageCount: 3
    }))

    const reportStream = await scrape( { groupSize: 2, groupInterval: 1, stopAtReportURI: 1  } )


    reportStream.on('data', (chunk) => {
      done.fail( new Error('No chunk should have been emitted by the stream') )
    })

    reportStream.on('end', () => {
      expect( scrapeIndex ).toHaveBeenCalledTimes(1)
      expect( scrapeReport ).not.toHaveBeenCalled()
      done()
    })

  })

  test( 'Throws parsing error and ends stream', async (done) => {

    scrapeIndex.mockImplementationOnce(() => ({ //page 1
      reportsURLs: [1],
      pageCount: 3
    })).mockImplementationOnce(() => ({ //page 2
      reportsURLs: [2,3],
    })).mockImplementationOnce(() => ({ //page 3
      reportsURLs: [4,5],
    }))


    scrapeReport.mockImplementation((url) => {
      if(url == 3){
        throw new Error('Parsing failed')
      }
    })

    const reportStream = await scrape( { groupSize: 2, groupInterval: 1  } )


    reportStream.on('error', (err) => {
      expect( err.message ).toEqual('Parsing failed')
    })


    reportStream.on('end', () => {
      expect( scrapeIndex ).toHaveBeenCalledTimes(2)
      expect( scrapeReport ).toHaveBeenCalledTimes(3)
      done()
    })

    reportStream.on('data', (chunk) => {
      jest.runOnlyPendingTimers()
    })


  })

})
