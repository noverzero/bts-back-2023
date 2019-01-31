var axios = require('axios')
// http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=Cher&api_key=bb5f39887cc93aa41c362ba1b8bbaccd&format=json

const pingSongKick = async () => {
try {
  console.log('ping songkick!')
  const response = await axios.get('https://api.songkick.com/api/3.0/venues/591/calendar.json?per_page=100&apikey=8ViJ6NJZPEwjp3Cp')
  
  let showsFromSongkick = response.data.resultsPage.results.event
  showsPerformance = showsFromSongkick.map(show=>show)
  
  showsObj = showsFromSongkick.map(show =>{ return {
    id: show.id, 
    displayName: show.displayName.split(' at Red Rocks')[0], 
    venue: show.venue.displayName.split(' Ampitheatre')[0],
    headliner: show.displayName.split(' at Red Rocks')[0].split(' with')[0],
    date: show.start.date.split('-').splice(1, 3).concat(show.start.date.split(`-`)[0]).join('/')
  }})
  console.log(showsObj)

} catch (err) {
  console.error(err)
}
  

}

module.exports = {pingSongKick}