const nodemailer = require('nodemailer');
const { head } = require('./app');
const EMAIL_PASS = process.env.EMAIL_PASS
const generateReminderEmailArray = require('./generateReminderEmailArray').generateReminderEmailArray



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
     const riderList = await reminderQuery()
    //result.email = email


  }

  const reminderQuery = () => {
      console.log('-reminderquery fired ')
    pool.connect((err, client, release) => {
        if (err) {
          return console.error('Error acquiring client', err.stack)
        }

        client.query(`
        WITH event_order_details AS (
	        SELECT o."orderedByEmail"
	            , o."orderedByFirstName"
	        	, o."orderedByLastName"
	        	, o."orderedByPhone"
	        	, o."id" AS order_id
	        	, r.id AS res_id
	        	, r."willCallFirstName"
	        	, r."willCallLastName"
	        	, pp.id AS party_id
	        	, pp."firstBusLoadTime" 
	        	, pp."lastBusDepartureTime"
	        	, pl."streetAddress" 
	        	, pl."locationName"
	        	, pl."city"
	        	, events."id" AS event_id
	        	, events."date"
	        	, events.headliner
	        	, events.support1
	        	, events.support2
	        	, events.support3
	        	, events.venue
	        FROM orders o
	        JOIN reservations r ON o.id = r."orderId"
	        JOIN pickup_parties pp ON r."pickupPartiesId" = pp.id
	        JOIN pickup_locations pl ON pp."pickupLocationId" = pl.id
	        JOIN events ON pp."eventId" = events.id
	        WHERE TO_DATE(events."date"::TEXT, 'MM/DD/YYYY') >= TO_DATE((current_date) ::TEXT, 'YYYY/MM/DD')
	        AND TO_DATE(events."date"::TEXT, 'MM/DD/YYYY') <= TO_DATE((current_date + 3) ::TEXT, 'YYYY/MM/DD')
	        AND r.status != 3
        ) SELECT  "orderedByEmail"
	            , INITCAP("orderedByFirstName") AS "orderedByFirstName" 
	        	, INITCAP("orderedByLastName") AS "orderedByLastName" 
	        	, "orderedByPhone"
	        	, order_id
	        	, INITCAP("willCallFirstName") AS "willCallFirstName" 
	        	, INITCAP("willCallLastName")  AS "willCallLastName"
	        	, party_id
	        	, "firstBusLoadTime" 
	        	, "lastBusDepartureTime"
	        	, "streetAddress" 
	        	, "locationName"
	        	, "city"
	        	, event_id
	        	, "date"
	        	, event_id
	        	, headliner
	        	, support1
	        	, support2
	        	, support3
	        	, venue
                , count(res_id) AS res_count
        FROM event_order_details 
		GROUP BY "orderedByEmail"
			    , order_id
	            , "orderedByFirstName"
	        	, "orderedByLastName"
	        	, "orderedByPhone"
	        	, "willCallFirstName"
	        	, "willCallLastName"
	        	, party_id
	        	, "firstBusLoadTime" 
	        	, "lastBusDepartureTime"
	        	, "streetAddress" 
	        	, "locationName"
	        	, "city"
	        	, "date"
	        	, event_id
	        	, headliner
	        	, support1
	        	, support2
	        	, support3
	        	, venue
		
        `, (err, result) => {
          release()
          if (err) {
            console.log('awwww nuts, ', err)
            return console.error('Error executing query', err.stack)
          }
          let riderList = result.rows
          if(riderList) {
            const formattedEmailList = generateReminderEmailArray(riderList)
            formattedEmailList.forEach(show => {
              show.forEach(s => {
               //console.log(' s ', s)
               const date = s.date
               const headliner = s.headliner
               const support1 = s.support1
               const support2 = s.support2
               const support3 = s.support3
               const venue = s.venue
               const parties = s.parties
               for ( const partyId in parties ){
                  const load = parties[partyId].load;
                  const depart = parties[partyId].depart;
                  const street = parties[partyId].street;
                  const locationName = parties[partyId].locationName;
                  const city = parties[partyId].city
                  const partyOrders = parties[partyId].orders
                  for (partyOrder in partyOrders) {
                    console.log( 'partyOrder  =====> ', partyOrder)
                  }
                  //console.log('partyRiders???? ', partyRiders)
               }
              })
              //console.log(' parties ====> ', show[0].parties)

                // const emailBody = `Thank you for riding with Bus to Show!
                // We just wanted to remind you about your bus trip  
                // coming up to ${venue} on ${date} for ${headliner}.  
                // You have ${orderDetail.res_count} spots reserved, which can be claimed at
                // check-in by ${orderDetail.ordereredByFirstName} ${orderDetail.orderedByLastName} or any of the 
                // will call names you listed in your order.  Also, pickup details.... check-in location is ${orderDetail.locationName},
                // ${orderDetail.streetAddress} with last bus departing at ${orderDetail.lastBusDepartureTime}.
                // `
                // console.log('emailBody  ===>  ', emailBody)

                // transporter.sendMail({
                //     from: 'updates@bustoshow.org',
                //     to: orderDetail.orderedByEmail,
                //     subject: 'Your Bus to Show Event Details',
                //     text: emailBody
                //   }, function(error, info){
                //     if (error) {
                //         console.error(error)
                //     } else {
                //       console.log(' here is what info is ', info)
                //       res.status(200).json(info.accepted)
                //   }
                //  })
              })

          }

        })


      })
  }
  module.exports = {sendReminder}

  // const orderDetail = 
  // [{
  //   orderedByEmail: 'jaclynwolff@aol.com',
  //   orderedByFirstName: 'Jaclyn',
  //   orderedByLastName: 'Wolff',
  //   orderedByPhone: '(303) 345-3888',
  //   order_id: 19641,
  //   willCallFirstName: 'Jaclyn',
  //   willCallLastName: 'Wolff',
  //   firstBusLoadTime: '15:00',
  //   lastBusDepartureTime: '15:30',
  //   streetAddress: '638 East Colfax Avenue, Denver, CO 80203',
  //   locationName: 'Denver - Colfax/Cap Hill Cheba Hut',
  //   city: 'Denver',
  //   date: '07/03/2022',
  //   headliner: 'Zeds Dead',
  //   support1: '',
  //   support2: '',
  //   support3: '',
  //   venue: 'Red Rocks Amphitheatre',
  //   res_count: '2'
  // },
  // {
  //   orderedByEmail: 'mbrom312@gmail.com',
  //   orderedByFirstName: 'Tobin',
  //   orderedByLastName: 'Bromberg',
  //   orderedByPhone: '(917) 968-5926',
  //   order_id: 19679,
  //   willCallFirstName: 'Tobin',
  //   willCallLastName: 'Bromberg',
  //   firstBusLoadTime: '15:00',
  //   lastBusDepartureTime: '15:30',
  //   streetAddress: '638 East Colfax Avenue, Denver, CO 80203',
  //   locationName: 'Denver - Colfax/Cap Hill Cheba Hut',
  //   city: 'Denver',
  //   date: '07/03/2022',
  //   headliner: 'Zeds Dead',
  //   support1: '',
  //   support2: '',
  //   support3: '',
  //   venue: 'Red Rocks Amphitheatre',
  //   res_count: '2'
  // },
  // {
  //   orderedByEmail: 'paza0406@colorado.edu',
  //   orderedByFirstName: 'Paul',
  //   orderedByLastName: 'Zarlingo',
  //   orderedByPhone: '(303) 717-1071',
  //   order_id: 19685,
  //   willCallFirstName: 'Paul',
  //   willCallLastName: 'Zarlingo',
  //   firstBusLoadTime: '15:00',
  //   lastBusDepartureTime: '15:30',
  //   streetAddress: '638 East Colfax Avenue, Denver, CO 80203',
  //   locationName: 'Denver - Colfax/Cap Hill Cheba Hut',
  //   city: 'Denver',
  //   date: '07/03/2022',
  //   headliner: 'Zeds Dead',
  //   support1: '',
  //   support2: '',
  //   support3: '',
  //   venue: 'Red Rocks Amphitheatre',
  //   res_count: '1'
  // },
  // {
  //   orderedByEmail: 'jordan.bourbo@gmail.com',
  //   orderedByFirstName: 'Jordan',
  //   orderedByLastName: 'Bourbo',
  //   orderedByPhone: '(706) 312-9653',
  //   order_id: 19557,
  //   willCallFirstName: 'Jordan',
  //   willCallLastName: 'Bourbo',
  //   firstBusLoadTime: '15:00',
  //   lastBusDepartureTime: '15:30',
  //   streetAddress: '638 East Colfax Avenue, Denver, CO 80203',
  //   locationName: 'Denver - Colfax/Cap Hill Cheba Hut',
  //   city: 'Denver',
  //   date: '07/03/2022',
  //   headliner: 'Zeds Dead',
  //   support1: '',
  //   support2: '',
  //   support3: '',
  //   venue: 'Red Rocks Amphitheatre',
  //   res_count: '2'
  // },
  // {
  //   orderedByEmail: 'jordan.a.hensel@gmail.com',
  //   orderedByFirstName: 'Jordan',
  //   orderedByLastName: 'Hensel',
  //   orderedByPhone: '(414) 617-7032',
  //   order_id: 19482,
  //   willCallFirstName: 'Jordan',
  //   willCallLastName: 'Hensel',
  //   firstBusLoadTime: '15:00',
  //   lastBusDepartureTime: '15:30',
  //   streetAddress: '638 East Colfax Avenue, Denver, CO 80203',
  //   locationName: 'Denver - Colfax/Cap Hill Cheba Hut',
  //   city: 'Denver',
  //   date: '07/03/2022',
  //   headliner: 'Zeds Dead',
  //   support1: '',
  //   support2: '',
  //   support3: '',
  //   venue: 'Red Rocks Amphitheatre',
  //   res_count: '3'
  // },
  // {
  //   orderedByEmail: 'sschloss12@gmail.com',
  //   orderedByFirstName: 'Scott',
  //   orderedByLastName: 'Schloss',
  //   orderedByPhone: '(513) 293-8130',
  //   order_id: 19639,
  //   willCallFirstName: 'Scott',
  //   willCallLastName: 'Schloss',
  //   firstBusLoadTime: '15:00',
  //   lastBusDepartureTime: '15:30',
  //   streetAddress: '638 East Colfax Avenue, Denver, CO 80203',
  //   locationName: 'Denver - Colfax/Cap Hill Cheba Hut',
  //   city: 'Denver',
  //   date: '07/03/2022',
  //   headliner: 'Zeds Dead',
  //   support1: '',
  //   support2: '',
  //   support3: '',
  //   venue: 'Red Rocks Amphitheatre',
  //   res_count: '1'
  // }]