const path = require('path');
const express = require('express');
const xss = require('xss');
const { logger } = require('../logger');
const { ValidationService } = require('../ValidationService');
const { requiredFavoritesDictionary } = require('../callerValidationData');
const FavoritesService = require('./FavoritesService');
const { requireAuth } = require('../middleware/jwt-auth');

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
    yearBuilt: Number(favorite.property.yearBuilt),
    longitude: Number(xss(favorite.property.longitude)),
    latitude: Number(xss(favorite.property.latitude)),
    description: xss(favorite.property.description),
    livingArea: Number(xss(favorite.property.livingArea)),
    currency: xss(favorite.property.currency),
    url: xss(favorite.property.url),
    photos: favorite.property.photos.map((url) => xss(url)),
  },
  user_id: Number(xss(favorite.user_id)),
});

favoritesRouter.get('/favorites', requireAuth, (req, res, next) => {
  FavoritesService.getAllFavorites(knex(req), req.user.id)
    .then((favorites) => {
      res.status(200).json(favorites.map(serializeData));
    })
    .catch(next);
});

favoritesRouter.post('/favorites', requireAuth, (req, res, next) => {
  const newFavorite = req.body;
  // VALIDATE
  const missingAndInvalidProps = ValidationService.validateProperties(
    newFavorite,
    requiredFavoritesDictionary
  );

  if (
    missingAndInvalidProps.invalidProps.length ||
    missingAndInvalidProps.missingProps.length
  ) {
    const validationErrorObj = ValidationService.createValidationErrorObject(
      missingAndInvalidProps
    );
    logger.error(validationErrorObj.error.message);
    return res.status(400).json(validationErrorObj);
  }

  // Add user id into entry
  newFavorite.user_id = req.user.id;

  // Insert new entry into the favorites table
  FavoritesService.insertFavorite(knex(req), newFavorite)
    .then((favorite) => {
      logger.info(`Favorite with the id ${favorite.id} created`);
      res
        .status(201)
        .location(path.posix.join(req.originalUrl, `/${favorite.id}`))
        .json(serializeData(favorite));
    })
    .catch(next);
});

favoritesRouter.all('/favorites/:id', requireAuth, (req, res, next) => {
  const id = req.params.id;
  FavoritesService.getById(knex(req), id)
    .then((favorite) => {
      if (!favorite) {
        return res.status(404).json({
          error: { message: 'Property does not exist' },
        });
      }
      res.favorite = favorite;
      next();
    })
    .catch(next);
});

favoritesRouter.get('/favorites/:id', (req, res, next) => {
  res.json(serializeData(res.favorite));
});

favoritesRouter.delete('/favorites/:id', (req, res, next) => {
  const id = req.params.id;
  FavoritesService.deleteFavorite(knex(req), id)
    .then(() => {
      res.status(204).end();
    })
    .catch(next);
});

module.exports = favoritesRouter;
