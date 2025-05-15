const Settings = require('../models/Settings');

// Get current settings or create default if none exist
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings' });
  }
};

// Update settings
exports.updateSettings = async (req, res) => {
  try {
    const { siteName, adminEmail, notificationEmail, enableNotifications } = req.body;
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }
    settings.siteName = siteName;
    settings.adminEmail = adminEmail;
    settings.notificationEmail = notificationEmail;
    settings.enableNotifications = enableNotifications;
    await settings.save();
    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Error updating settings' });
  }
};
