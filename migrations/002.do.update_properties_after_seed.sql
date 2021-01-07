BEGIN;

UPDATE properties 
SET location = coordinates.coordinate
FROM coordinates 
WHERE properties.id = coordinates.id;

COMMIT;