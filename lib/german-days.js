const assert = require('assert')
const days = ['montag','dienstag','mittwoch','donnerstag','freitag','samstag','sonntag']

assert( days.length == 7 )

module.exports = {
  days,
  nameToNumber: (day, offset = 1) => days.findIndex( (d) => d == day.toLowerCase() ) + offset,
  removeThem: (str, suffix = false) => {
    const asRegex = days.map((d) => {
      if(!suffix){
        return d
      }
      return d+"("+suffix+")?"
    }).join('|')
    return str.replace( new RegExp( asRegex, 'gi' ), '' )
  }
}
