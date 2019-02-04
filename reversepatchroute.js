//restore discount code remaining uses after timer expires on abandoned checkout.
router.patch('/return/:id', function(req, res, next){
  let id = req.params.id
  let timesUsed = req.body.timesUsed
  knex('discount_codes')
    .join('discount_codes_events', 'discount_codes.id', 'discount_codes_events.discountCodeId')
    .join('events', 'discount_codes_events.eventsId', 'events.id')
    .where('discount_codes.id', id)
    .select('*')
    .first()
    .then((match) => {
      knex('discount_codes')
      .where('discount')
      .update
    })
})
