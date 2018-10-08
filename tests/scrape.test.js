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

describe('Scraper', () => {

  beforeEach(() => {
    setTimeout.mockClear()
    scrapeIndex.mockReset()
    scrapeReport.mockReset()
  })

  test( 'No URLs, one page', async () => {

    scrapeIndex.mockImplementationOnce(() => ({
      reportURLs: [],
      pageCount: 1
    }))

    const result = await scrape( )

    expect( scrapeIndex ).toHaveBeenCalledTimes(1)
    expect( scrapeReport ).not.toHaveBeenCalled()
  })

  test( 'Wait between requests groups', async () => {

    scrapeIndex.mockImplementation(() => ({
      reportsURLs: [1,2,3,4,5],
      pageCount: 1
    }))

    const result = await scrape( { groupSize: 2, groupInterval: 1000 } )

    /*
     * Add the rest of the test to the PromiseJobs queue
     * see https://stackoverflow.com/questions/52177631/jest-timer-and-promise-dont-work-well-settimeout-and-async-function
     */
    await Promise.resolve()
    expect( scrapeReport ).toHaveBeenCalledTimes(2)

    jest.advanceTimersByTime(1000)
    await Promise.resolve()
    expect( scrapeReport ).toHaveBeenCalledTimes(4)

    jest.advanceTimersByTime(500) //still waiting
    await Promise.resolve()
    expect( scrapeReport ).toHaveBeenCalledTimes(4)

    jest.advanceTimersByTime(500) //done
    await result

    expect( setTimeout ).toHaveBeenCalledTimes(2)
    expect( setTimeout ).toHaveBeenLastCalledWith(expect.any(Function), 1000)
    expect( scrapeIndex ).toHaveBeenCalledTimes(1)
    expect( scrapeReport ).toHaveBeenCalledTimes(5)
    expect( scrapeReport ).toHaveBeenCalledWith( 1 )
    expect( scrapeReport ).toHaveBeenCalledWith( 2 )
    expect( scrapeReport ).toHaveBeenCalledWith( 3 )
    expect( scrapeReport ).toHaveBeenCalledWith( 4 )
    expect( scrapeReport ).toHaveBeenCalledWith( 5 )
  })

  test( 'Scrape all pages', async () => {
    scrapeIndex.mockImplementationOnce(() => ({ //page 1
      reportsURLs: [1],
      pageCount: 3
    })).mockImplementationOnce(() => ({ //page 2
      reportsURLs: [2,3],
    })).mockImplementationOnce(() => ({ //page 3
      reportsURLs: [4,5],
    }))

    const result = await scrape( { groupSize: 2, groupInterval: 1000 } )

    await Promise.resolve()
    expect( scrapeIndex ).toHaveBeenCalledTimes(1)
    expect( scrapeReport ).toHaveBeenCalledTimes(1)

    jest.runAllTimers()
    await Promise.resolve()
    
    expect( scrapeIndex ).toHaveBeenCalledTimes(2)
    expect( scrapeReport ).toHaveBeenCalledTimes(3)

    jest.runAllTimers()
    await result
    
    expect( scrapeIndex ).toHaveBeenCalledTimes(3)
    expect( scrapeReport ).toHaveBeenCalledTimes(5)
    expect( setTimeout ).toHaveBeenCalledTimes(2)
  })

  test( 'Use correct page URLs', async () => {
    scrapeIndex.mockImplementationOnce(() => ({ //page 1
      reportsURLs: [1],
      pageCount: 3
    })).mockImplementationOnce(() => ({ //page 2
      reportsURLs: [2,3],
    })).mockImplementationOnce(() => ({ //page 3
      reportsURLs: [4,5],
    }))

    const result = await scrape( { groupSize: 2, groupInterval: 1 } )
    jest.runAllTimers()
    await Promise.resolve()
    jest.runAllTimers()
    await result

    expect( scrapeIndex ).toHaveBeenCalledWith( DEFAULT_INDEX_URL )
    expect( scrapeIndex ).toHaveBeenCalledWith( urlOfPage(2) )
    expect( scrapeIndex ).toHaveBeenCalledWith( urlOfPage(3) )
  })

  test( 'Stop scraping at given report URI (excluded)', async () => {
    scrapeIndex.mockImplementationOnce(() => ({ //page 1
      reportsURLs: [1],
      pageCount: 3
    })).mockImplementationOnce(() => ({ //page 2
      reportsURLs: [2,3],
    })).mockImplementationOnce(() => ({ //page 3
      reportsURLs: [4,5],
    }))

    const result = await scrape( { groupSize: 2, groupInterval: 1, stopAtReportURI: 3  } )
    jest.runAllTimers()
    await Promise.resolve()
    await result

    expect( scrapeIndex ).toHaveBeenCalledTimes(2)
    expect( scrapeReport ).toHaveBeenCalledTimes(2)
    expect( scrapeReport ).toHaveBeenCalledWith( 1 )
    expect( scrapeReport ).toHaveBeenCalledWith( 2 )
  })

})
