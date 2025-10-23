import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Badge,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
  Avatar
} from '@mui/material';
import {
  Notifications as NotificationIcon,
  MarkEmailRead as MarkReadIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon
} from '@mui/icons-material';
import { notificationService } from '../services/notificationService';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [createDialog, setCreateDialog] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info',
    priority: 'medium'
  });

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data.notifications || data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data.count || 0);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === id ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(notif => notif._id !== id));
      setUnreadCount(prev => {
        const deletedNotif = notifications.find(notif => notif._id === id);
        return deletedNotif && !deletedNotif.read ? Math.max(0, prev - 1) : prev;
      });
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleCreateNotification = async () => {
    try {
      await notificationService.createNotification(newNotification);
      setCreateDialog(false);
      setNewNotification({ title: '', message: '', type: 'info', priority: 'medium' });
      fetchNotifications();
    } catch (err) {
      console.error('Failed to create notification:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <SuccessIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationIcon />
              </Badge>
              <Typography variant="h6">
                Notifications
              </Typography>
            </Box>
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
              >
                Mark All Read
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialog(true)}
              >
                Create
              </Button>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <List>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification._id}>
                <ListItem
                  sx={{
                    backgroundColor: notification.read ? 'transparent' : 'action.hover',
                    borderRadius: 1,
                    mb: 1
                  }}
                >
                  <ListItemIcon>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1" fontWeight={notification.read ? 'normal' : 'bold'}>
                          {notification.title}
                        </Typography>
                        <Chip
                          label={notification.priority}
                          color={getPriorityColor(notification.priority)}
                          size="small"
                          variant="outlined"
                        />
                        {!notification.read && (
                          <Chip label="New" color="error" size="small" />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formatDate(notification.createdAt)}
                        </Typography>
                      </Box>
                    }
                  />
                  <Box display="flex" gap={1}>
                    {!notification.read && (
                      <IconButton
                        size="small"
                        onClick={() => handleMarkAsRead(notification._id)}
                        title="Mark as read"
                      >
                        <MarkReadIcon />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(notification._id)}
                      title="Delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>

          {notifications.length === 0 && !loading && (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="textSecondary">
                No notifications
              </Typography>
              <Typography variant="body2" color="textSecondary">
                You're all caught up!
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Create Notification
          <IconButton
            onClick={() => setCreateDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={newNotification.title}
              onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Message"
              multiline
              rows={3}
              value={newNotification.message}
              onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={newNotification.type}
                onChange={(e) => setNewNotification(prev => ({ ...prev, type: e.target.value }))}
                label="Type"
              >
                <MenuItem value="info">Info</MenuItem>
                <MenuItem value="success">Success</MenuItem>
                <MenuItem value="warning">Warning</MenuItem>
                <MenuItem value="error">Error</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={newNotification.priority}
                onChange={(e) => setNewNotification(prev => ({ ...prev, priority: e.target.value }))}
                label="Priority"
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateNotification}
            variant="contained"
            disabled={!newNotification.title || !newNotification.message}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotificationCenter;
