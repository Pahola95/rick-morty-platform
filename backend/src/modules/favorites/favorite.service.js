const Favorite = require('./favorite.model');
const { publishMessage } = require('../../config/rabbitmq');

const getFavorites = async (userId) => {
  return await Favorite.find({ userId });
};

const addFavorite = async (userId, data) => {
  const existing = await Favorite.findOne({ userId, type: data.type, externalId: data.externalId });
  if (existing) throw { status: 400, message: 'Ya está en favoritos' };

  const favorite = await Favorite.create({ ...data, userId });

  await publishMessage('notifications', {
    userId,
    message: `Agregaste "${data.name}" a favoritos`
  });

  return favorite;
};

const removeFavorite = async (userId, id) => {
  const favorite = await Favorite.findOneAndDelete({ _id: id, userId });
  if (!favorite) throw { status: 404, message: 'Favorito no encontrado' };
  return { message: 'Eliminado de favoritos' };
};

module.exports = { getFavorites, addFavorite, removeFavorite };
