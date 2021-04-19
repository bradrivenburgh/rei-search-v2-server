const FavoritesService = {
  getAllFavorites(knex, userId) {
    return knex
      .select('*')
      .from('favorites')
      .where('user_id', userId);
  },
  insertFavorite(knex, newFavorite) {
    return knex
      .insert({id: newFavorite.id, property: newFavorite.property})
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