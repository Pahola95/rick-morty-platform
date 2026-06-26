const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    auth0Id: {
      type: String,
      unique: true,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      unique: true,
      sparse: true // permite múltiples documentos sin email (null)
    },
    role: {
      type: String,
      enum: ['ADMIN', 'USER'],
      default: 'USER'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
