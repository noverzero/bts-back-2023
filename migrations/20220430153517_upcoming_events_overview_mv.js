
exports.up = function(knex) {
// Raw query ===>
                // CREATE MATERIALIZED VIEW public.upcoming_events_overview_mv
                // TABLESPACE pg_default
                // AS SELECT e.id,
                //     e.date,
                //     e."startTime",
                //     e.doors_time,
                //     e.venue,
                //     e.headliner,
                //     e.support1,
                //     e.support2,
                //     e.support3,
                //     e."headlinerBio",
                //     e."headlinerImgLink",
                //     e."meetsCriteria",
                //     e."isDenied",
                //     e.external,
                //     e.created_at,
                //     e.updated_at,
                //     e.date::date AS sort_date,
                //     COALESCE(( SELECT sum(pp.capacity) AS sum
                //            FROM pickup_parties pp
                //           WHERE pp."eventId" = e.id), 0::bigint) AS capacity,
                //     COALESCE(( SELECT count(reservations.id) AS count
                //            FROM reservations
                //              JOIN pickup_parties pp ON pp.id = reservations."pickupPartiesId"
                //           WHERE e.id = pp."eventId" AND (reservations.status = ANY (ARRAY[1, 2]))), 0::bigint) AS reservations,
                //     CURRENT_DATE AS refreshed_at
                //    FROM events e
                //   WHERE to_date(e.date::text, 'MM/DD/YYYY'::text) >= CURRENT_DATE
                //   GROUP BY e.id
                //   ORDER BY (e.date::date)
                // WITH DATA;
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
