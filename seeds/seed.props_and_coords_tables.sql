BEGIN;

COPY coordinates (coordinate) FROM '/home/brivenbu/www/rei-search-v2/rei-search-v2-server/property-data/coordinates.json';
COPY properties (property) FROM '/home/brivenbu/www/rei-search-v2/rei-search-v2-server/property-data/properties.json';

COMMIT;