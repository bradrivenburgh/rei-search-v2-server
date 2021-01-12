const express = require("express");
const xss = require("xss");
const { logger } = require("../logger");
const {
  savedProps,
} = require("../mockData");
const FavoritesService = require("./FavoritesService");

const favoritesRouter = express.Router();
const knex = (req) => req.app.get('db');

const serializeData = (favorite) => ({
  id: favorite.id,
  property: {
    address: {
      streetAddress: xss(favorite.property.address.streetAddress),
      city: xss(favorite.property.address.city),
      state: xss(favorite.property.address.state),
      zipcode: xss(favorite.property.address.zipcode),
      neighborhood: null,
      community: null,
      subdivision: null,
    },
    bedrooms: Number(xss(favorite.property.bedrooms)),
    bathrooms: Number(xss(favorite.property.bathrooms)),
    price: Number(xss(favorite.property.price)),
    yearBuilt: Number((favorite.property.yearBuilt)),
    longitude: Number(xss(favorite.property.longitude)),
    latitude: Number(xss(favorite.property.latitude)),
    description: xss(favorite.property.description),
    livingArea: Number(xss(favorite.property.livingArea)),
    currency: xss(favorite.property.currency),
    url: xss(favorite.property.url),
    photos: favorite.property.photos.map(url => xss(url)),
  },
});

favoritesRouter.route("/favorites").get((req, res, next) => {
  FavoritesService.getAllFavorites(knex(req))
    .then(favorites => {
      res
        .status(200)
        .json(favorites.map(serializeData))
    })
    .catch(next)

});

module.exports = favoritesRouter;
