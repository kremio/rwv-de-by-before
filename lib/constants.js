const  DEFAULT_INDEX_URL = 'https://muenchen-chronik.de/chronik/'
const  FIRST_PAGE = 1

module.exports = {
  DEFAULT_INDEX_URL,
  FIRST_PAGE,
  urlOfPage: (pageNum) => `https://muenchen-chronik.de/chronik/?sf_paged=${pageNum}`,
  pageNumberOfURL: (pageURL) => {
    if( pageURL == DEFAULT_INDEX_URL ){
      return 1
    }

    return Number( pageURL.match(/[0-9]+$/)[0] )
  }
}
