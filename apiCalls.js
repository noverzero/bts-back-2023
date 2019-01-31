// http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=Cher&api_key=bb5f39887cc93aa41c362ba1b8bbaccd&format=json

const pingSongKick = () => {
  console.log('ping songkick!')
}  
// const response = await fetch(`https://api.songkick.com/api/3.0/venues/591/calendar.json?per_page=100&apikey=8ViJ6NJZPEwjp3Cp`)
// const json = await response.json()
// const shows = json.resultsPage.results.event


// newState.shows.map(show => show.displayName = show.displayName.split(’ at Red Rocks’)[0])
// newState.shows.map(show => show.venue.displayName = show.venue.displayName.split(' Amphitheatre’)[0])
// newState.shows.map(show => show.start.date = show.start.date.split(‘-’).splice(1, 3).concat(show.start.date.split(‘-’)[0]).join(‘/’))
module.exports = pingSongKick