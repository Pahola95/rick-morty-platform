const episodeService = require('./episode.service');

const getEpisodes = async (req, res, next) => {
  try {
    const { page, name, episode } = req.query;
    const data = await episodeService.getEpisodes(page, { name, episode });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

const getEpisodeById = async (req, res, next) => {
  try {
    const data = await episodeService.getEpisodeById(req.params.id);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

const getEpisodeStats = async (req, res, next) => {
  try {
    const data = await episodeService.getEpisodeStats();
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

module.exports = { getEpisodes, getEpisodeById, getEpisodeStats };