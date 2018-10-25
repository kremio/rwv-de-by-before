module.exports = {
  /*
   * 'uri': {
   *   ...
   *   name/value pairs of properties to override
   *   ...
   * }
   * 
   * note that the following group of properties are parse together, so if you override one, you MUST override all in the group as these properties won't be parsed at all
   * 
   * [startDate, endDate, title]
   * [locations, motives, factums, contexts]
   */
  "https://muenchen-chronik.de/5-juli-pegida-kundgebung/":{
    startDate: ( new Date( "2017-07-05" ) ).toISOString(), //5. Juli 2017
    title: "Pegida – Kundgebung"
  }
}
