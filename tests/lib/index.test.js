const fs = require('fs')
const request = require('request')
const scrapeIndex = require('../../lib/index')

//const reportJson = require('../samples/report.json')
//Mock HTTP requests
jest.mock('request')


const expectedResult = {
  reportsURLs:
    [ 'https://muenchen-chronik.de/8-september-2018-rassistische-beleidigung-und-angriff/',
      'https://muenchen-chronik.de/3-september-2018/',
      'https://muenchen-chronik.de/25-26-august-2018-ib-ns-parolen-und-neonazistische-poebeleien/',
      'https://muenchen-chronik.de/23-august-2018-rassistischer-angriff/',
      'https://muenchen-chronik.de/14-august-2018-rassismus-am-arbeitsplatz/',
      'https://muenchen-chronik.de/7-august-2018-antisemitische-und-rassistische-parolen/',
      'https://muenchen-chronik.de/7-august-2018-hitlergruss-vor-der-feldherrenhalle/',
      'https://muenchen-chronik.de/4-august-2018-auseinandersetzung-um-neonazistische-taetowierung/',
      'https://muenchen-chronik.de/3-august-2018-prozess-gegen-reichsbuerger/',
      'https://muenchen-chronik.de/31-juli-2018-muslimenfeindliches-und-antisemitisches-graffito/',
      'https://muenchen-chronik.de/30-juli-2018-mann-ruft-sieg-heil-und-zeigt-den-hitlergruss/',
      'https://muenchen-chronik.de/23-juli-2018-rassistischer-angriff/'
    ],
  pageCount: 36
}


test( 'Base test', async () => {
  //Use a pre-fetched sample report
  const sampleIndex = fs.readFileSync('./tests/samples/index.html', 'utf8')
  request.mockImplementation((...args) => {
    const cb = args.pop()
    cb( null, {statusCode: 200}, sampleIndex )
  })

  const result = await scrapeIndex( 'https://domain.tld/path/to/page.html' )
  expect( result ).toEqual( expectedResult )
})
