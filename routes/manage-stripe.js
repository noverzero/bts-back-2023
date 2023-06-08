const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_LIVESECRETKEY);
require('dotenv').config();
const express = require('express');
const router = express.Router();

const getStripeData = async (start, end) => {
    const startDate = start;
    const endDate = end;
  
    if (!startDate || !endDate) {
      return 'Both start_date and end_date are required.';
    }
  
    const payments = await getPayments(startDate, endDate);
  
    if (payments) {
      return payments;
    } else {
      return 'An error occurred while fetching payments.';
    }
}

const getPayments = async (startDate, endDate) => {
  try {
    const totalResObj = {
        boulder: 0,
        denver: 0,
    }
    const payments = await stripe.charges.list({
      created: {
        gte: 1681766464,
        lte: endDate
      },
      limit: 100,
    });
    const paymentsArray = payments.data.filter((payment) => payment.metadata.eventId === '40300580').map((payment) => {
      const usefulPaymentObj = {
        id: payment.id,
        email: payment.metadata.email,
        eventId: payment.metadata.eventId,
        firstName: payment.metadata.firstName,
        lastName: payment.metadata.lastName,
        orderedByPhone: payment.metadata.orderedByPhone,
        pickupLocationId: payment.metadata.pickupLocationId,
        ticketQuantity: payment.metadata.ticketQuantity,
        totalCost: payment.metadata.totalCost,
        willCallFirstName: payment.metadata.willCallFirstName,
        willCallLastName: payment.metadata.willCallLastName,
        amountRefund: payment.amount_refunded,
        refunded: payment.refunded,
    }
    return usefulPaymentObj.email;
    });
    console.log('paymentsArray ==>>==>> ', paymentsArray);
    return paymentsArray;
  } catch (error) {
    console.error(`Error fetching payments: ${error}`);
    return null;
  }
};

router.get('/payments', async (req, res) => {
  const startDate = req.query.start_date;
  const endDate = req.query.end_date;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Both start_date and end_date are required.' });
  }

  const payments = await getPayments(startDate, endDate);

  if (payments) {
    res.status(200).json(payments);
  } else {
    res.status(500).json({ error: 'An error occurred while fetching payments.' });
  }
});




module.exports = {getStripeData};

