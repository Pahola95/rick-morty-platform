const episodeService = require('./episode.service');

const getEpisodes = async (req, res, next) => {
  try {
    const { page, name, episode } = req.query;
    const data = await episodeService.getEpisodes(page, { name, episode });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getEpisodeById = async (req, res, next) => {
  try {
    const data = await episodeService.getEpisodeById(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getEpisodeStats = async (req, res, next) => {
  try {
    const data = await episodeService.getEpisodeStats();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const uploadEpisodesCSV = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(422).json({ success: false, message: 'No se recibió ningún archivo CSV' });
    }

    const results = await episodeService.uploadEpisodesFromCSV(req.file.buffer, req.user._id);

    res.status(201).json({
      success: true,
      message: `Carga completada: ${results.inserted} insertados, ${results.skipped} duplicados omitidos`,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

const getLocalEpisodes = async (req, res, next) => {
  try {
    const data = await episodeService.getLocalEpisodes();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const deleteLocalEpisode = async (req, res, next) => {
  try {
    const data = await episodeService.deleteLocalEpisode(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const deleteAllLocalEpisodes = async (req, res, next) => {
  try {
    const data = await episodeService.deleteAllLocalEpisodes();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEpisodes,
  getEpisodeById,
  getEpisodeStats,
  uploadEpisodesCSV,
  getLocalEpisodes,
  deleteLocalEpisode,
  deleteAllLocalEpisodes,
};
