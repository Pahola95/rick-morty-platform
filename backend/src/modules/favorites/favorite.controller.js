const favoriteService = require('./favorite.service');

const getFavorites = async (req, res, next) => {
  try {
    const data = await favoriteService.getFavorites(req.user.id);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

const addFavorite = async (req, res, next) => {
  try {
    const data = await favoriteService.addFavorite(req.user.id, req.body);
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};

const removeFavorite = async (req, res, next) => {
  try {
    const data = await favoriteService.removeFavorite(req.user.id, req.params.id);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

module.exports = { getFavorites, addFavorite, removeFavorite };