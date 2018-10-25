const requestAsync = require('./request-async')
const cheerio = require('cheerio')
const url = require('url')

const preset = require('./preset')
const {ReportParserError} = require('./errors')
const germanMonths = require('./german-months')
const boroughs = require('./boroughs')
const motives = require('./motives')
const factums = require('./factums')
const contexts = require('./contexts')



const parseDate = (date) => {

  const shortDate = /^[^0-9]?([0-9]{1,2}\.)\s*([0-9]{1,2}\.)\s*([0-9]+).?$/
  if( shortDate.test(date) ){
    const [all, day, month, year] = date.match(shortDate)
    return {
      day: Number( day.replace('.','') ),
      month:  Number( month.replace('.','') ),
      year: year.length < 4 ? 2000 + Number(year) : Number(year)
    }
  }

  const [all, day, month, year] = date.match(/^[^0-9]?([0-9]{1,2}\.)\s+(.*)\s+([0-9]+).?$/)

  return {
    day: Number( day.replace('.','') ),
    month: germanMonths.nameToNumber(month),
    year: Number(year)
  }
}

/*
 * Extract the date and title of the report from the given header text
 */
const parseH1 = (text) => {
  const [date, ...title] = text.split("–")
  let days
  if( date.trim().length < 4  ){ //the days were separated with "–"
    days = [date, title.shift()]
  }else{
  //(d./)?d. Monat YYYY
    days = date.trim().split('/')
  }
  const {day, month, year} = parseDate( days.pop() )

  //Create dates for all the days
  const dates = days
    .map( (d) => Number( d.replace('.','') ) )
    .map( (d) => new Date( `${year}-${month}-${d}` ) )

  dates.push( new Date( `${year}-${month}-${day}` ) )

  return {
    dates,
    title: title.join("–").trim()
  }
}

/*
 * Extract the location, motives, contexts, factums from a list
 * of classnames separated by spaces.
 */
const parseClassNames = (classNames) => {
  return classNames.split(' ')
    .reduce( (acc, name) => {
      const prefix = name.split('-')[0]
      switch( prefix ){
        case 'category':
          const borough = boroughs[ name.replace(prefix+'-', '') ]
          acc.locations.push({
            subdivisions: ['Muenchen', borough]
          })
          break;
        case 'motiv':
          const motive = motives[ name.replace(prefix+'-', '') ]
          acc.motives.push(motive)
          break;
        case 'handlung':
          const factum = factums[ name.replace(prefix+'-', '') ]
          acc.factums.push(factum)
          break;
        case 'kontext':
          const context = contexts[ name.replace(prefix+'-', '') ]
          acc.contexts.push(context)
          break;
        default:
      }
      return acc
    },{
      locations:[],
      motives:[],
      factums:[],
      contexts:[]
    })
}

/*
 * Parse the sources from a plain text string.
 */

const parseSources = (sources) => {
  return sources.replace('Quelle:','')
    .replace(/(\(.+),(.+\))/, '$1%$2') //replace commas inside parens by %
    .replace(/\sund\s/,',') //turn " und "s into commas
    .split(',')
    .map( (source) => source.trim() )
    .map( (source) => {
      let name = source
      let publishedDate = null
      let url = null
      
      if( source.indexOf("vom") >= 0 ){
        const {day, month, year} = parseDate( source.match(/vom(.*)$/)[1].trim() )
        publishedDate = new Date( `${year}-${month}-${day}` ).toISOString()
        name = name.replace(/vom(.*)$/,'').trim()
      }

      //Very permissive regex to find URLs
      url = name.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g)
      if(url){ //only a single URL taken into account
        
        try{
          url = new URL( url[0] ).href
        }catch(e){ //Most likely reason, the protocol is missing
          if( !/^.+:\/\//.test(url[0]) ){ //use http by default
            url = new URL( 'http://'+url[0] ).href
          }else{
            throw new Error("Failed to parse URL: ", url[0])
          }
        }
      }

      name = name.replace('%',',') //undo the comma substitution
      return {
        name,
        publishedDate,
        url
      }
    })
}


module.exports = async ( url ) => {
  //Get a report preset, this is the mechanism to handle special cases
  //that would otherwise make the parser throw errors
  const report = preset(url)
  try{
    //Fetch the HTML
    const answer = await requestAsync( url )
    //Load it into cheerio
    const $ = cheerio.load( answer.body )

    const article = $('article').first()

    //Only override the preset where needed
    if( !report.startDate && !report.endDate && !report.title ){
      const { dates, title } = parseH1( article.find('h1').first().text() )
      //Only the start and end date are needed
      const startDate = dates.shift().toISOString()
      const endDate = dates.length > 0 ? dates.pop().toISOString() : undefined
      Object.assign(report, { startDate, endDate, title })
    }

    if( !report.locations && !report.motives && !report.factums && !report.contexts ){
      Object.assign( report, parseClassNames( article.attr('class') ) )
    }

    if( !report.description ){
      const description = article.find('.entry-content').first().text().trim().replace(/\t| {2,}/g,'')

      Object.assign( report, {description})
    }

    if( !report.sources ){
      const sources = parseSources( article.find('span.smallinfo').first().text() )
      Object.assign( report, {sources})
    }

    return report
  }catch(e){
    throw new ReportParserError( e, url )
  }

}

