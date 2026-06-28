const mongoose = require('mongoose');

/**
 * Stores episodes loaded via CSV that are not present in the Rick & Morty public API.
 * The `externalId` field is intentionally absent — these are local-only episodes.
 * IDs are assigned sequentially starting from a high offset (e.g. 100000) to avoid
 * collisions with the external API episode IDs.
 */
const localEpisodeSchema = new mongoose.Schema(
  {
    // Human-readable unique code, e.g. S05E01
    episode: {
      type: String,
      required: true,
      unique: true,
      match: [/^S\d{2}E\d{2}$/i, 'El código debe tener formato S##E## (ej. S05E01)'],
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    air_date: {
      type: String,
      required: true,
      trim: true,
    },
    characters: {
      type: [String],
      default: [],
    },
    // User who uploaded this episode (audit trail)
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

localEpisodeSchema.index({ name: 'text' });

module.exports = mongoose.model('LocalEpisode', localEpisodeSchema);
