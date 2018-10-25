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
  },
  "https://muenchen-chronik.de/8-mai-2017-rassistische-schmiererei/":{
    startDate: ( new Date( "2017-05-08" ) ).toISOString(), //8. Mai 2017
    title: "Rassistische Schmiererei"
  },
  
  //The 3 below are related incidents
  "https://muenchen-chronik.de/april-2017-rechtsradikaler-angriff/":{
    startDate: ( new Date( "2017-04-01" ) ).toISOString(),
    endDate: ( new Date('2017-04-31') ).toISOString(),
    title: "Rechtsradikaler Angriff"
  },
  "https://muenchen-chronik.de/februar-2017-rechtsradikaler-angriff/":{
    startDate: ( new Date( "2017-02-01" ) ).toISOString(),
    endDate: ( new Date('2017-02-31') ).toISOString(),
    title: "Rechtsradikaler Angriff"
  },
  "https://muenchen-chronik.de/februar-2016-rechtsradikale-drohungen/":{
    startDate: ( new Date( "2016-02-01" ) ).toISOString(),
    endDate: ( new Date('2016-02-31') ).toISOString(),
    title: "Rechtsradikale Drohungen"
  }
  
}
