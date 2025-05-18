const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  siteName: {
    type: String,
    required: true,
    default: 'NextGen Hardware'
  },
  adminEmail: {
    type: String,
    required: true,
    default: 'admin@example.com'
  }
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
