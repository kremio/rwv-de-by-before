//NOTE: can't use node's promisify because request
//callback takes more than 2 parameters
//const {promisify} = require('util')
const request =  require('request')

module.exports = async (...options) => new Promise( (success, failure) => {
  request(...options, (error, response, body) => {
    if(error){
      failure(error)
      return
    }

    success({response, body})
  })
})
