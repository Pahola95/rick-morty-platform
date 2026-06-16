const locationService = require('./location.service');

const getLocations = async (req, res, next) => {
  try {
    const { page, name, type, dimension } = req.query;
    const data = await locationService.getLocations(page, { name, type, dimension });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

const getLocationById = async (req, res, next) => {
  try {
    const data = await locationService.getLocationById(req.params.id);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

const getLocationStats = async (req, res, next) => {
  try {
    const data = await locationService.getLocationStats();
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

module.exports = { getLocations, getLocationById, getLocationStats };