const ContactMessage = require('../models/ContactMessage');

exports.submitMessage = async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const contactMessage = new ContactMessage({ name, email, message, date: new Date() });
    await contactMessage.save();
    res.status(201).json({ message: 'Message received successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save message' });
  }
};

exports.getAllMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ date: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve messages' });
  }
};
