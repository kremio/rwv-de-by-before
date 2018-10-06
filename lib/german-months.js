const assert = require('assert')
const months = ['januar','februar','märz','april','mai','juni','juli','august','september','oktober','november','dezember']

assert( months.length == 12 )

module.exports = {
  months,
  nameToNumber: (month, offset = 1) => months.findIndex( (m) => m == month.toLowerCase() ) + offset
}
