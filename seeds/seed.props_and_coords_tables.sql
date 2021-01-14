BEGIN;

/* Local */

COPY coordinates (coordinate) FROM '/home/brivenbu/www/rei-search-v2/rei-search-v2-server/property-data/coordinates.json';
COPY properties (property) FROM '/home/brivenbu/www/rei-search-v2/rei-search-v2-server/property-data/properties.json';

/* For heroku -- heroku run bash ; get db password fro heroku pg:credentials:url
  cat /app/property-data/coordinates.json | psql -h ec2-54-156-73-147.compute-1.amazonaws.com -p 5432 -d d8o94lei3hl2v4 -U nvykwrqqczhghd -c "COPY coordinates (coordinate) FROM STDIN;"
  cat /app/property-data/properties.json | psql -h ec2-54-156-73-147.compute-1.amazonaws.com -p 5432 -d d8o94lei3hl2v4 -U nvykwrqqczhghd -c "COPY properties (property) FROM STDIN;"
*/

COMMIT;