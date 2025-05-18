const Settings = require('../models/Settings');

// Get current settings or create default if none exist
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({
        siteName: 'NextGen Hardware',
        adminEmail: 'admin@example.com'
      });
      await settings.save();
    }
    const { siteName, adminEmail, _id, createdAt, updatedAt } = settings;
    res.json({ siteName, adminEmail, _id, createdAt, updatedAt });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings' });
  }
};

// Update settings
exports.updateSettings = async (req, res) => {
  try {
    console.log('Received updateSettings request body:', req.body);

    let { siteName, adminEmail } = req.body;

    // Basic validation
    if (typeof siteName !== 'string' || siteName.trim() === '') {
      return res.status(400).json({ message: 'Invalid siteName' });
    }
    if (typeof adminEmail !== 'string' || adminEmail.trim() === '') {
      return res.status(400).json({ message: 'Invalid adminEmail' });
    }

    siteName = siteName.trim();
    adminEmail = adminEmail.trim();

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({
        siteName,
        adminEmail
      });
    } else {
      settings.siteName = siteName;
      settings.adminEmail = adminEmail;
    }
    await settings.save();
    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    console.error(error.stack);
    res.status(500).json({ message: 'Error updating settings' });
  }
};
