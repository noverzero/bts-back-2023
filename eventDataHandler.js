var axios = require('axios')
const knex = require('./knex.js')
const lastFmApiKey = process.env.LASTFM_KEY
const songKickApiKey = process.env.SONGKICK_KEY

// make the api call to last.fm

// make the api call to songkick
const getApiData = async () => {
  try {
    const responseSongKick = await axios.get(`https://api.songkick.com/api/3.0/venues/591/calendar.json?page=1&per_page=100&apikey=${songKickApiKey}`)
    const showsFromSongkick = responseSongKick.data.resultsPage.results.event // grab just the events objects
    var showsObj = showsFromSongkick.map(show=>{
      let headlinerName = show.performance[0].displayName
      let support1 = ''
      let support2 = ''
      let support3 = ''
      let time = show.start.time
      let date = show.start.date.split('-').splice(1, 3).concat(show.start.date.split(`-`)[0]).join('/')
      if (show.performance[1]) {
        support1 = show.performance[1].displayName
      }
      if (show.performance[2]) {
        support2 = show.performance[2].displayName
      }
      if (show.performance[3]) {
        support3 = show.performance[3].displayName
      }
      if (show.start.time === null) {
        time = '00:00:00'
      }
      return {
        id: show.id,
        date: date,
        startTime: time,
        venue: show.venue.displayName.split(' Ampitheatre')[0],
        headliner: headlinerName,
        support1: support1,
        support2: support2,
        support3: support3,
        headlinerImgLink: 'headlinerImg',
        headlinerBio: ''
      }
    })
    var filteredShowsObj = filterShowsObj(showsObj)
    var artistsObj = filterArtists(filteredShowsObj)
    var lastFmObj = await pingLastFm(artistsObj).then(data => data)
  } catch (err) {
    console.error(err)
  }


  const finalShowsObj = combineObjects(lastFmObj, filteredShowsObj)
  return finalShowsObj
}

const filterShowsObj = (showsObj) => {
  return showsObj.reduce((newShows, currShow) => {
    return newShows.find(show => show.date === currShow.date && show.venue === currShow.venue) ? newShows : newShows.push(currShow) && newShows
  }, [])
}

const filterArtists = (filteredShowsObj) =>{
  return filteredShowsObj.map(show => { // filter out most punctuation that breaks urls
    show = show.headliner
    show = show.replace(/[&]/g, 'and')
    .replace(/[\/\\#,+()$~%.":*?<>{}]/g, '')
    .replace(/' /g, ' ')
    return show.split(' ').join('+')
  })
}
const pingLastFm = (artistsObj) => {
    const headlinerInfo = artistsObj.map((artist, i) => {
    const lastFmApi = encodeURI(`http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${artist}&autocorrect=1&api_key=${lastFmApiKey}&format=json`)
    //encodeURI allows for UTF-8 conversion of special letters in band name

    return axios.get(lastFmApi)
    .then(data=>{

      return data.data
    })
    .catch(err=>{
      console.error('error!', err)
    })
  })
  // map over array of band names, assign a promise to each one
  return Promise.all(headlinerInfo).then((headlinerObj)=>{
    const headlinerInfoObj1 = headlinerObj.map(data=>{
      if(data.error){
        return new Error("artist does not exist in Last.fm")
      }
      const headlinerName = data.artist.name // || "Headliner Name"  //not sure why this doesn't default to the string in the absence of data.artist.name
      const headlinerImg = data.artist.image[2]['#text']
      const headlinerBio = data.artist.bio.content

      return { headlinerName, headlinerImg, headlinerBio  }
    })
    // after promise fulfilled, populate an object with the fields above and return it to the previous function
    return headlinerInfoObj1
  })
  .catch(err=>{
    console.error(err)
  })
}

const combineObjects = async (lastFmObj, showsObj) => {
  // combine data from the two objects
  const data = showsObj.map((show, i) => {
    return {
      ...show,
      headlinerImgLink: lastFmObj[i].headlinerImg,
      headlinerBio: lastFmObj[i].headlinerBio
    }
  })
  return data
}

const insertEventData = (allShowsObj) => {
// pull event id's from the table, compare all current id's to all id's in allShowsObj, filter out objects where the id already exists in db
  knex('events')
    .select('id')
    .returning('id')
    .then(result=>{
      result = result.map(elem => elem.id)
      let newShowsArr = allShowsObj.filter(show=>{
        if (!result.includes(show.id)) {
          return show
        }
      })
      console.log('newShowsArr', newShowsArr.length);
      var newShowsIdAndStartTime = newShowsArr.map(show=>{
        return {
          'id': show.id,
          'startTime': convertTimeToMinutes(show.startTime)
        }})
      knex('events')
      .insert(newShowsArr)
      .returning('*').then(result=>{
        addPickupParties(newShowsIdAndStartTime)
      })

    })
    .catch(err=>{
      console.log(err)
    })
}
// math from "hh:mm:ss" to minutes as a number
const convertTimeToMinutes = (time = 0) => {
  let newTime = time.split(':')
  newTime = parseInt(newTime[0])*60+parseInt(newTime[1])
  return newTime
}

// calculate last bus departure time in minutes then format back to "hh:mm"
const calcDepartTime = (time, diff) => {

  //console.log('time in calcDepartTime', time)
  let convertedTime = convertTimeToMinutes(time)
  let result = ""
  if (time === '00:00:00') {
    result = `00:00`
  }
  else {
    //console.log('Number(convertedTime): ' , Number(convertedTime))
    let newTime = Number(convertedTime) - Number(diff)
    let hours = parseInt(newTime / 60)
    let minutes = (newTime % 60).toString().padStart(2,"0")
    result = `${hours}:${minutes}`
  }
  return result
}

// format each pickup location with its unique last bus departure times and aggregate into an array of objects
const addPickupParties = (newShowsIdAndStartTime) => {
  let newPickupParties = []
  console.log('newShowsIdAndStartTime', newShowsIdAndStartTime);
  newShowsIdAndStartTime.forEach(show=>{
    return newPickupParties.push({ pickupLocationId:1,
        eventId: show.id,
        lastBusDepartureTime: calcDepartTime(show.startTime, 90) },
      { pickupLocationId:2,
        eventId: show.id,
        lastBusDepartureTime: calcDepartTime(show.startTime, 60) },
      { pickupLocationId:3,
        eventId: show.id,
        lastBusDepartureTime: calcDepartTime(show.startTime, 90) },
      { pickupLocationId:4,
        eventId: show.id,
        lastBusDepartureTime: calcDepartTime(show.startTime, 75) },
      { pickupLocationId:5,
        eventId: show.id,
        lastBusDepartureTime: calcDepartTime(show.startTime, 60) },
      { pickupLocationId:6,
        eventId: show.id,
        lastBusDepartureTime: calcDepartTime(show.startTime, 135) },
      { pickupLocationId:7,
        eventId: show.id,
        lastBusDepartureTime: calcDepartTime(show.startTime, 210),
        partyPrice: 30.00},
      { pickupLocationId:9,
        eventId: show.id,
        lastBusDepartureTime: calcDepartTime(show.startTime, 90)},
      )
    })
  knex('pickup_parties')
  .insert(newPickupParties).returning('*').then(result=>{console.log('added pickup_parties', result.length || 0)})
}

const checkForExistingParties = (pickupLocationId) => {
   const response = knex('pickup_parties')
  .where('pickupLocationId', pickupLocationId)
  .select('eventId', "pickupLocationId")
  .then(alreadyThere =>{
    let alreadyThereArr = []
      alreadyThere.map(obj => {
        alreadyThereArr.push(obj.eventId)
      })
        //console.log(alreadyThereArr)
        return alreadyThereArr
      }).catch(err => {
    console.log('error in checkForExistingParties ::: ', err)
  })
  //console.log('reeeeesponse:: ',response)
  return response
}

checkForExistingParties(9).then(alreadyThereArr => addSouthDock(alreadyThereArr))

const addSouthDock = (alreadyThereArr) => {
   console.log("hi southDock!")


     knex('events')
     .select('id', 'date', 'meetsCriteria', 'isDenied', 'external', 'startTime')
     .then((data) => {
       let dryDockParties = []
       data.map(show => {
         console.log('is alreadyThereArr here?', alreadyThereArr)
         let tooSoon = Date.now() + 172800000 //calculate tim in milliseconds 72  hours later than right now
         if (!alreadyThereArr.includes(show.id) && (new Date(show.date).getTime() > tooSoon) && show.meetsCriteria && !show.isDenied && !show.external){
           let time = show.startTime
           return dryDockParties.push(
             {
               pickupLocationId: 9,
               eventId: show.id,
               lastBusDepartureTime: calcDepartTime(time, 90),
               capacity: 200,
             }
           )
         }
       })
       knex('pickup_parties')
       .insert(dryDockParties).returning('*').then(result=>{console.log('added dryDockParties', result.length || 0)})

   })

}


module.exports = {getApiData, insertEventData}
