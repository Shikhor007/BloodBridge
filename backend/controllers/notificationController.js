const { db } = require('../models/dbAdapter');

exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await db.find('notifications', n => n.user_id === req.user.userId);
    const sorted = notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const unreadCount = sorted.filter(n => !n.is_read).length;

    return res.json({
      success: true,
      unreadCount,
      data: sorted
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await db.update('notifications', n => n.notification_id === Number(id) && n.user_id === req.user.userId, n => {
      n.is_read = 1;
    });

    return res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update notification.' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await db.update('notifications', n => n.user_id === req.user.userId, n => {
      n.is_read = 1;
    });

    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update notifications.' });
  }
};
