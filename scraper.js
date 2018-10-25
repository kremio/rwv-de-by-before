//NOTE: When morph.io executes the scraper, it sets process.env.NODE_ENV
//to 'production'
const scraperPipeline = require('./pipeline')

scraperPipeline()
  .catch( (e) => {
    console.error(e)
    console.log(e.stack)
    process.kill(1)
})
