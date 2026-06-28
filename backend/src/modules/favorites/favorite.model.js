const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['CHARACTER', 'LOCATION', 'EPISODE'],
      required: true
    },
    externalId: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    name: {
      type: String
    },
    image: {
      type: String
    }
  },
  { timestamps: true }
);

// Índice único para evitar duplicados por usuario
favoriteSchema.index({ userId: 1, type: 1, externalId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
