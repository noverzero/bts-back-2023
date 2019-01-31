import Schedule from 'node-schedule'

var j = Schedule.scheduleJob('1 * * * *', function(){
  console.log('The answer to life, the universe, and everything!');
});
