const nodemailer = require('nodemailer')
const EMAIL_PASS = process.env.EMAIL_PASS



const whitelist = process.env.ORIGIN_URL.split(' ')
// Parse the environment variable into an object
const parse = require("pg-connection-string").parse;
const pgconfig = parse(process.env.DATABASE_URL);
pgconfig.ssl = { rejectUnauthorized: false };
const Pool = require('pg').Pool
const pool = new Pool(pgconfig)

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'updates@bustoshow.org',
      pass: EMAIL_PASS
    }
  });

 const sendReminder = async ()=>{
    let result = await reminderQuery()
    //result.email = email

    console.log('we good! ', result)
    transporter.sendMail({
      from: 'updates@bustoshow.org',
      to: 'dustin@undefinedindustries.com',
      subject: 'Your Bus to Show Event Details',
      text: `Thank you for riding with Bus to Show!  `
    }, function(error, info){
      if (error) {
          console.error(error)
      } else {
      }
    })
  }

  const reminderQuery = () => {
    pool.connect((err, client, release) => {
        if (err) {
          return console.error('Error acquiring client', err.stack)
        }

        client.query(`

        SELECT "orderedByEmail"
        FROM orders
        JOIN reservations r ON orders.id = r."orderId"
        JOIN pickup_parties pp ON r."pickupPartiesId" = pp.id
        JOIN events ON pp."eventId" = events.id
        WHERE events."date"::text = (current_date + INTERVAL '1 day')::text
        
        `, (err, result) => {
          release()
          if (err) {
            return console.error('Error executing query', err.stack)
          }
          return result.rows
        })
      })
  }
  module.exports = {sendReminder}
