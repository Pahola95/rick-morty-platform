const characterService = require('./character.service');

const getCharacters = async (req, res, next) => {
  try {
    const { page, name, status, species } = req.query;
    const data = await characterService.getCharacters(page, { name, status, species });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

const getCharacterById = async (req, res, next) => {
  try {
    const data = await characterService.getCharacterById(req.params.id);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

const getCharacterStats = async (req, res, next) => {
  try {
    const data = await characterService.getCharacterStats();
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

const getCharactersByIds = async (req, res, next) => {
  try {
    const data = await characterService.getCharactersByIds(req.params.ids);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

module.exports = { getCharacters, getCharacterById, getCharacterStats, getCharactersByIds };