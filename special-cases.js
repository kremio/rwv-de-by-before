const tc = require("timezonecomplete") //timezone aware dates
const TIMEZONE = ' Europe/Berlin'

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
    startDate: ( new tc.DateTime( "2017-07-05T00:00"+TIMEZONE ) ).toIsoString(), //5. Juli 2017
    title: "Pegida – Kundgebung"
  },
  "https://muenchen-chronik.de/8-mai-2017-rassistische-schmiererei/":{
    startDate: ( new tc.DateTime( "2017-05-08T00:00"+TIMEZONE ) ).toIsoString(), //8. Mai 2017
    title: "Rassistische Schmiererei"
  },
  
  //The 3 below are related incidents
  "https://muenchen-chronik.de/april-2017-rechtsradikaler-angriff/":{
    startDate: ( new tc.DateTime( "2017-04-01T00:00"+TIMEZONE ) ).toIsoString(),
    endDate: ( new tc.DateTime("2017-04-30T00:00"+TIMEZONE) ).toIsoString(),
    title: "Rechtsradikaler Angriff"
  },
  "https://muenchen-chronik.de/februar-2017-rechtsradikaler-angriff/":{
    startDate: ( new tc.DateTime( "2017-02-01T00:00"+TIMEZONE ) ).toIsoString(),
    endDate: ( new tc.DateTime("2017-02-28T00:00"+TIMEZONE) ).toIsoString(),
    title: "Rechtsradikaler Angriff"
  },
  "https://muenchen-chronik.de/februar-2016-rechtsradikale-drohungen/":{
    startDate: ( new tc.DateTime( "2016-02-01T00:00"+TIMEZONE ) ).toIsoString(),
    endDate: ( new tc.DateTime("2016-02-29T00:00"+TIMEZONE) ).toIsoString(),
    title: "Rechtsradikale Drohungen"
  },

  "https://muenchen-chronik.de/6-7-april-2017-missionierung-gefluechteter/":{
    startDate: (new tc.DateTime( "2017-04-06T00:00"+TIMEZONE ) ).toIsoString(),
    endDate: (new tc.DateTime( "2017-04-07T00:00"+TIMEZONE ) ).toIsoString(),
    title: "Missionierung Geflüchteter"
  },
  "https://muenchen-chronik.de/31-mai1-juni-2016/":{
    startDate: (new tc.DateTime( "2016-05-31T00:00"+TIMEZONE ) ).toIsoString(),
    endDate: (new tc.DateTime( "2016-06-01T00:00"+TIMEZONE ) ).toIsoString(),
    title: "Unbekannte ritzen Hakenkreuz in Auto vor Moschee"
  },
  "https://muenchen-chronik.de/mai-2016-rassistische-beschimpfungen-und-drohungen/":{
    startDate: (new tc.DateTime( "2016-05-01T00:00"+TIMEZONE ) ).toIsoString(),
    endDate: (new tc.DateTime( "2016-05-31T00:00"+TIMEZONE ) ).toIsoString(),
    title: "Unbekannte ritzen Hakenkreuz in Auto vor Moschee"
  },
  "https://muenchen-chronik.de/maerz-2016-verurteilung-wegen-uebergriffen/":{
    startDate: (new tc.DateTime( "2016-03-01T00:00"+TIMEZONE ) ).toIsoString(),
    endDate: (new tc.DateTime( "2016-03-31T00:00"+TIMEZONE ) ).toIsoString(),
    title: "Verurteilung wegen Übergriffen"
  },
  "https://muenchen-chronik.de/ende-mai-2015-der-dritte-weg-flugblattverteilung-gegen-gefluechtete/":{
    startDate: ( new tc.DateTime("2015-05-24T00:00"+TIMEZONE) ).toIsoString(),
    endDate: ( new tc.DateTime("2015-05-31T00:00"+TIMEZONE) ).toIsoString(),
    title: "Der Dritte Weg – Flugblattverteilung gegen Geflüchtete"
  },
  "https://muenchen-chronik.de/25-oktober-2014-internationale-gesellschaft-fuer-menschenrechte-kundgebung/":{
    startDate: ( new tc.DateTime("2014-10-25T00:00"+TIMEZONE) ).toIsoString(),
    title: "„Internationale Gesellschaft für Menschenrechte“ – Kundgebung"
  },
  //'bis' between dates
  "https://muenchen-chronik.de/31-januar-2014-bis-2-februar-2014-die-neonazistische-swoboda-partei-beteiligt-sich-am-muenchener-mini-maidan/":{
    startDate: ( new tc.DateTime("2014-01-31T00:00"+TIMEZONE) ).toIsoString(),
    endDate: ( new tc.DateTime("2014-02-02T00:00"+TIMEZONE) ).toIsoString(),
    title: "Swoboda Aktivisten beim Münchener „Mini-Maidan“"
  },
  "https://muenchen-chronik.de/8-juli-2016/":{
    sources:[{
      name:"Pressebericht des Polizeipräsidiums München",
      publishedDate: ( new tc.DateTime("2016-07-13T00:00"+TIMEZONE) ).toIsoString(),
    },{
      name:"Pressemeldung des Polizeipräsidiums München",
      publishedDate: ( new tc.DateTime("2016-07-14T00:00"+TIMEZONE) ).toIsoString(),
    },{
      name:"Pressemeldung des Polizeipräsidiums München",
      publishedDate: ( new tc.DateTime("2016-07-18T00:00"+TIMEZONE) ).toIsoString(),
    },{
      name:"Süddeutschen Zeitung",
      publishedDate: ( new tc.DateTime("2016-07-13T00:00"+TIMEZONE) ).toIsoString(),
    },{
      name:"TZ",
      publishedDate: ( new tc.DateTime("2016-07-14T00:00"+TIMEZONE) ).toIsoString(),
    }]
  },
  "https://muenchen-chronik.de/24-juni-2015-brandstiftung-an-moschee/":{
    sources:[{
      name:"a.i.d.a."
    },{
      name:"Pressebericht des Polizeipräsidiums München",
      publishedDate: ( new tc.DateTime("2015-06-24T00:00"+TIMEZONE) ).toIsoString()
    }]
  },
  "https://muenchen-chronik.de/31-oktober-4-november-2018-hakenkreuz-schmiererei-an-arztpraxis/":{
    startDate: ( new tc.DateTime("2018-10-31T20:00"+TIMEZONE) ).toIsoString(),
    endDate: ( new tc.DateTime("2018-11-04T21:00"+TIMEZONE) ).toIsoString(),
    title: "Hakenkreuz-Schmiererei an Arztpraxis"
  },
  "https://muenchen-chronik.de/29-oktober-antisemitische-und-neonazistische-graffiti/":{
    startDate: ( new tc.DateTime("2018-10-29T09:00"+TIMEZONE) ).toIsoString(),
    title: "Antisemitische und neonazistische Graffiti"
  },
  "https://muenchen-chronik.de/8-mai-2019-hitlergruss-vor-synagoge/":{
    sources:[{
      name:"a.i.d.a."
    },{
      name:"Pressemitteilungen des Polizeipräsidiums München",
      publishedDate: ( new tc.DateTime("2019-05-10T00:00"+TIMEZONE) ).toIsoString()
    },{
      name:"Pressemitteilungen des Polizeipräsidiums München",
      publishedDate: ( new tc.DateTime("2019-05-23T00:00"+TIMEZONE) ).toIsoString()
    }]
  }
}
