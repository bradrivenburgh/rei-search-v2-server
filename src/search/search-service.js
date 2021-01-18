const SearchService = {
  getProperties(knex, searchLocation) {
    return knex
      .raw(
      `
        SELECT
          id, property, ST_DistanceSphere(geometry(p.location), ST_MakePoint(${searchLocation})) as distance
        FROM
          properties p 
        WHERE 
          ST_DistanceSphere(geometry(p.location), ST_MakePoint(${searchLocation})) <= 10000.00
        ORDER BY distance
        LIMIT 50;
      `
      )
      .then((properties) => {
        return properties;
      });
  },
};

module.exports = SearchService;