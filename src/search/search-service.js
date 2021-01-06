const SearchService = {
  getProperties(knex, searchLocation) {
    return knex
      .select("property")
      .from("properties")
      .whereRaw(
        `ST_DistanceSphere(geometry(properties.location),
        ST_MakePoint(${searchLocation})) <= ?`, [10000.00]
      )
      .limit(50)
      .then((properties) => {
        return properties;
      });
  },
};

module.exports = SearchService;