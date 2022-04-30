
exports.up = function(knex) {
// Raw query ===>
    // `CREATE MATERIALIZED VIEW IF NOT EXISTS upcoming_events_overview_mv as 
    //     SELECT e.*, e."date"::date AS sort_date
    //                     , COALESCE((select SUM(capacity) FROM pickup_parties pp WHERE pp."eventId" = e.id ), 0) AS capacity
    //                     , COALESCE(
    //                         (SELECT COUNT(reservations.id) FROM reservations 
    //                         JOIN pickup_parties pp  ON pp.id = reservations."pickupPartiesId" 
    //                         WHERE e.id = pp."eventId" AND reservations.status IN (1, 2)), 0) AS reservations
    //                     , CURRENT_DATE AS refreshed_at
    //                 FROM events e
    //                 WHERE TO_DATE(e."date", 'MM/DD/YYYY') >= CURRENT_DATE

    //                 GROUP BY e."id"
    //                 ORDER BY sort_date
    // WITH DATA;`
    knex.schema.createMaterializedView('upcoming_events_overview_mv', function (view) {
        view.columns([
            'id', 'date', 'startTime', 'venue', 'headliner', 'support1', 'support2',
            'support3', 'headlinerBio', 'headlinerImgLink', 'meetsCriteria', 'isDenied',
            'external', 'sort_date', 'capacity', 'reservations'
        ]);
        view.as(knex.raw(`
        SELECT e.*, e."date"::date AS sort_date
                , COALESCE((select SUM(capacity) FROM pickup_parties pp WHERE pp."eventId" = e.id ), 0) AS capacity
                , COALESCE(
                    (SELECT COUNT(reservations.id) FROM reservations 
                    JOIN pickup_parties pp  ON pp.id = reservations."pickupPartiesId" 
                    WHERE e.id = pp."eventId" AND reservations.status IN (1, 2)), 0) AS reservations
            FROM events e
            WHERE TO_DATE(e."date", 'MM/DD/YYYY') >= CURRENT_DATE

            GROUP BY e."id"
            ORDER BY sort_date;
        `));
      })
  
};

exports.down = function(knex) {
    knex.schema.dropView('upcoming_events_overview_mv')
};
