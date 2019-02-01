var axios = require('axios')
const knex = require('./knex.js')

// make the api call to last.fm
const pingLastFm = (artistsObj) => {
    console.log('lastfm')
    const headlinerInfo = artistsObj.map((artist) => {
    const lastFmApi = encodeURI(`http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${artist}&autocorrect=1&api_key=bb5f39887cc93aa41c362ba1b8bbaccd&format=json`) //encodeURI allows for special letters in band name
    
    return axios.get(lastFmApi)
    .then(data=>{
      return data.data
    })
    .catch(err=>{
      console.log('error!', err)
    })
  })
  // map over array of band names, assign a promise to each one
  return Promise.all(headlinerInfo).then((headlinerObj)=>{
    const headlinerInfoObj1 = headlinerObj.map(data=>{
      if(data.error){
        return new Error("artist does not exist in Last.fm")
      }
      
      const headlinerName = data.artist.name
      const headlinerImg = data.artist.image[2]['#text']
      const headlinerBio = data.artist.bio.content 
      return { headlinerName, headlinerImg, headlinerBio  }
    })
    // after promise fulfilled, populate an object with the fields above and return it to the previous function
    return headlinerInfoObj1
  })
  .catch(err=>{
    console.log(err)
  })
  
}

// make the api call to songkick
const getApiData = async () => {
  try {
    console.log("songkick")
    const responseSongKick = await axios.get('https://api.songkick.com/api/3.0/venues/591/calendar.json?per_page=100&apikey=8ViJ6NJZPEwjp3Cp')
    const showsFromSongkick = responseSongKick.data.resultsPage.results.event // grab just the events objects
    // console.log(showsFromSongkick[0])
    const artistsObj = showsFromSongkick.map(show => { // filter out most punctuation that breaks urls
      show = show.performance[0].displayName
      show = show.replace(/[&]/g, 'and')
                .replace(/[\/\\#,+()$~%.":*?<>{}]/g, '')
                .replace(/' /g, ' ')
      return show.split(' ').join('+')
    })
    
    lastFmObj = await pingLastFm(artistsObj).then(data => data)
        
    showsObj = showsFromSongkick.map( (show) =>{ 
      let headlinerName = show.performance[0].displayName
      let support1 = ''
      let support2 = ''
      let support3 = ''
      let time = show.start.time
      if (show.performance[1]) {
        support1 = show.performance[1].displayName
      } 
      if (show.performance[2]) {
        support1 = show.performance[2].displayName
      } 
      if (show.performance[3]) {
        support1 = show.performance[3].displayName
      } 
      if (show.start.time === null) {
        time = '00:00:00'
      }
      return {
        id: show.id, 
        date: show.start.date.split('-').splice(1, 3).concat(show.start.date.split(`-`)[0]).join('/'),
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
  } catch (err) {
    console.error(err)
  }
  const finalShowsObj = combineObjects(lastFmObj, showsObj)
  return finalShowsObj
}

const combineObjects = async (lastFmObj, showsObj) => {
// combine data from the two objects
console.log('combine')
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
  console.log('insert!')
// pull event id's from the table, compare all current id's to all id's in allShowsObj, 
// filter out objects where the id already exists in db
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

      knex('events')
        .insert(newShowsArr)
        .returning('*').then(result=>console.log('inserted:',result))
      })
}

module.exports = {getApiData, insertEventData}