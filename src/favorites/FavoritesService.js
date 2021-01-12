const FavoritesService = {
  getAllFavorites(knex) {
    return knex
      .select('*')
      .from('favorites');
  },
  insertFavorite(knex, newFolder) {
    return knex
      .insert(newFolder)
      .into('favorites')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },
  getById(knex, id) {
    return knex
      .select('*')
      .from('favorites')
      .where({ id })
      .first();
  },
  deleteFavorite(knex, id) {
    return knex
      .select('*')
      .from('favorites')
      .where({ id })
      .delete();
  },
};

module.exports = FavoritesService;