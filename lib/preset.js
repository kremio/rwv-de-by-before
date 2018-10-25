const cases = require('../special-cases')

const DEFAULT = {
  uri: null,
  title: null,
  description: null,
  startDate: null,
  endDate: undefined,
  iso3166_2: "DE-BY",//Bavaria
  locations:null,
  sources:null,
  motives:null,
  contexts:null,
  factums:null,
  tags: null
}

const preset = (uri) => Object.assign( {},
  DEFAULT,
  {uri},
  cases[uri]
)

module.exports = preset
