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
  },
  notificationEmail: {
    type: String,
    required: true,
    default: 'notify@example.com'
  },
  itemsPerPage: {
    type: Number,
    required: true,
    default: 25
  },
  enableNotifications: {
    type: Boolean,
    required: true,
    default: true
  }
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
