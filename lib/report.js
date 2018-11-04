const requestAsync = require('./request-async')
const cheerio = require('cheerio')
const url = require('url')
var tc = require("timezonecomplete") //timezone aware dates
const TIMEZONE = ' Europe/Berlin'

const preset = require('./preset')
const {ReportParserError} = require('./errors')
const germanMonths = require('./german-months')
const germanDays = require('./german-days')
const boroughs = require('./boroughs')
const motives = require('./motives')
const factums = require('./factums')
const contexts = require('./contexts')

const fourDigitYear = ( year ) => year.trim().length < 4 ? 2000 + Number( year.trim() ) : Number( year.trim() )

const isYearOnly = (date) => {
  const tokens = date.match( /^\s*([0-9]{2,})\s*$/ )
  
  if( !tokens ){
    return false
  }

  return fourDigitYear( tokens[1] )
}

const isMonthAndYearOnly = (date) => {
  const tokens = date.match(/^\s*([^0-9]+)\s+([0-9]{2,})/)

  if( !tokens ){
    return false
  }

  return {
    month: germanMonths.nameToNumber( tokens[1].trim() ),
    year: fourDigitYear( tokens[2] )
  }
}

const parseDate = (date) => {

  const shortDate = /^[^0-9]?([0-9]{1,2}\.)\s*([0-9]{1,2}\.)\s*([0-9]+).?$/
  if( shortDate.test(date) ){
    const [all, day, month, year] = date.match(shortDate)
    return {
      day: Number( day.replace('.','') ),
      month:  Number( month.replace('.','') ),
      year: fourDigitYear(year)
    }
  }

  const [all, day, month, year] = date.match(/^[^0-9]?([0-9]{1,2}\.)\s+(.*)\s+([0-9]+).?$/)

  return {
    day: Number( day.replace('.','') ),
    month: germanMonths.nameToNumber(month),
    year: fourDigitYear(year)
  }
}

/*
 * Extract the date and title of the report from the given header text
 */
const parseH1 = (text) => {
  const [date, ...title] = text.split("–")
  let days
  let dates

  const yearOnly = isYearOnly(date)
  const yearAndMonth = !yearOnly ? isMonthAndYearOnly(date) : false
  
  if( yearOnly ){
    //Record start on 1st january of the year
    //Record end on 31st decemeber of year
    dates = [
      new tc.DateTime( `${yearOnly}-01-01T00:00${TIMEZONE}` ),
      new tc.DateTime( `${yearOnly}-12-31T00:00${TIMEZONE}` ),
    ]
  }else if( yearAndMonth ){
    //Record the start of the month as the start date
    dates = [  new tc.DateTime( `${yearAndMonth.year}-${yearAndMonth.month.toString().padStart(2,'0')}-01T00:00${TIMEZONE}` ) ]

    //Record the first day of the next month as the last date
    yearAndMonth.month = (yearAndMonth.month + 1) % 12
    if( yearAndMonth.month == 1 ){
      yearAndMonth.year += 1
    }

    dates.push( new tc.DateTime( `${yearAndMonth.year}-${yearAndMonth.month.toString().padStart(2,'0')}-01T00:00${TIMEZONE}` ) )
  }else{

    if( date.trim().length < 4  ){ //the days were separated with "–"
      days = [date, title.shift()]
    }else{
      //(d./)?d. Monat YYYY
      days = date.trim().split('/')
    }
    const {day, month, year} = parseDate( days.pop() )

    //Create dates for all the days
    dates = days
      .map( (d) => Number( d.replace('.','') ) )
      .map( (d) => new tc.DateTime( `${year}-${month.toString().padStart(2,'0')}-${d.toString().padStart(2,'0')}T00:00${TIMEZONE}` ) )

    dates.push( new tc.DateTime( `${year}-${month.toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}T00:00${TIMEZONE}` ) )
  }
  
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
  const sourcesArr = germanDays.removeThem( sources.replace('Quelle:',''), ',')
    .replace(/(\(.+),(.+\))/, '$1%$2') //replace commas inside parens by %
    .replace(/\sund\s+([^0-9])/,',$1') //turn " und "s into commas
    .split(',')
    .map( (source) => source.trim() )
    .map( (source) => {
      let name = source
      let publishedDate = null
      let url = null
      if( source.indexOf("vom") >= 0 ){
        const {day, month, year} = parseDate( source.match(/vom(.*)$/)[1].trim().split(/\/|und/).pop() )
        publishedDate = new tc.DateTime( `${year}-${month.toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}T00:00${TIMEZONE}` ).toIsoString()
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

  if( sourcesArr.length == 1 && sourcesArr[0].name.trim().length == 0 ){
    sourcesArr[0].name = 'anonymous'
  }

  return sourcesArr
}

const parseTags = (tags) => tags.replace('Schlagworte:','')
  .split(',')
  .map( (t) => t.trim() )
  .filter( (t) => t.length > 0 )


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
      const startDate = dates.shift().toIsoString()
      const endDate = dates.length > 0 ? dates.pop().toIsoString() : undefined
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
      const sourcesNode = article.find('span.smallinfo').filter( function(){
        return /^\s*Quelle/.test( $(this).text() )
      } )
      const sources = parseSources( sourcesNode.first().text() )
      Object.assign( report, {sources})
    }

    if( !report.tags ){
      const tagsNode = article.find('span.smallinfo').filter( function(){
        return /^\s*Schlagworte/.test( $(this).text() )
      } )
      const tags = parseTags( tagsNode.first().text() )
      if(tags.length > 0){
        Object.assign( report, {tags})
      }
    }



    return report
  }catch(e){
    throw new ReportParserError( e, url )
  }

}

