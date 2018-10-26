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
  },

  "https://muenchen-chronik.de/6-7-april-2017-missionierung-gefluechteter/":{
    startDate: (new Date( "2017-04-06" ) ).toISOString(),
    endDate: (new Date( "2017-04-07" ) ).toISOString(),
    title: "Missionierung Geflüchteter"
  },
  "https://muenchen-chronik.de/31-mai1-juni-2016/":{
    startDate: (new Date( "2016-05-31" ) ).toISOString(),
    endDate: (new Date( "2016-06-01" ) ).toISOString(),
    title: "Unbekannte ritzen Hakenkreuz in Auto vor Moschee"
  },
  "https://muenchen-chronik.de/mai-2016-rassistische-beschimpfungen-und-drohungen/":{
    startDate: (new Date( "2016-05-01" ) ).toISOString(),
    endDate: (new Date( "2016-05-31" ) ).toISOString(),
    title: "Unbekannte ritzen Hakenkreuz in Auto vor Moschee"
  },
  "https://muenchen-chronik.de/maerz-2016-verurteilung-wegen-uebergriffen/":{
    startDate: (new Date( "2016-03-01" ) ).toISOString(),
    endDate: (new Date( "2016-03-31" ) ).toISOString(),
    title: "Verurteilung wegen Übergriffen"
  },
  "https://muenchen-chronik.de/ende-mai-2015-der-dritte-weg-flugblattverteilung-gegen-gefluechtete/":{
    startDate: ( new Date('2015-05-24') ).toISOString(),
    endDate: ( new Date('2015-05-31') ).toISOString(),
    title: "Der Dritte Weg – Flugblattverteilung gegen Geflüchtete"
  },
  "https://muenchen-chronik.de/25-oktober-2014-internationale-gesellschaft-fuer-menschenrechte-kundgebung/":{
    startDate: ( new Date('2014-10-25') ).toISOString(),
    title: "„Internationale Gesellschaft für Menschenrechte“ – Kundgebung"
  },
  //'bis' between dates
  "https://muenchen-chronik.de/31-januar-2014-bis-2-februar-2014-die-neonazistische-swoboda-partei-beteiligt-sich-am-muenchener-mini-maidan/":{
    startDate: ( new Date('2014-01-31') ).toISOString(),
    endDate: ( new Date('2014-02-02') ).toISOString(),
    title: "Swoboda Aktivisten beim Münchener „Mini-Maidan“"
  }
}
