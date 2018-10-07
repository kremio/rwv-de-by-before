const request =  require('request')
const requestAsync = require('./request-async')
const cheerio = require('cheerio')
const url = require('url')

module.exports = async ( url ) => {
  //Fetch the HTML
  const answer = await requestAsync( url )
  //Load it into cheerio
  const $ = cheerio.load( answer.body )

  //Get all the links to reports
  const reportsURLs = $('article a.more')
    .map( function (){
      return this.attribs['href']
    } )
    .get()

  //The number of pages
  const pageCount = $(".wp-pagenavi a.last").first()
    .attr('href')
    .match(/([0-9]+)$/)[1]

  return {
    reportsURLs,
    pageCount: Number(pageCount)
  }
}
