import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Chip
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Palette as PaletteIcon,
  Notifications as NotificationIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { settingsService } from '../../services/settingsService';
import { useAuth } from '../../hooks/useAuth';

const Settings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [settings, setSettings] = useState({
    theme: {
      mode: 'dark',
      primaryColor: '#00ADB5',
      fontSize: 14
    },
    notifications: {
      email: true,
      push: true,
      sms: false,
      frequency: 'immediate'
    },
    privacy: {
      dataSharing: false,
      analytics: true,
      cookies: true
    },
    system: {
      autoBackup: true,
      cacheSize: 100,
      logLevel: 'info'
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const [themeSettings, notificationSettings, systemSettings] = await Promise.all([
        settingsService.getThemeSettings().catch(() => null),
        settingsService.getNotificationSettings().catch(() => null),
        settingsService.getSystemConfiguration().catch(() => null)
      ]);

      setSettings(prev => ({
        ...prev,
        theme: { ...prev.theme, ...themeSettings },
        notifications: { ...prev.notifications, ...notificationSettings },
        system: { ...prev.system, ...systemSettings }
      }));
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      await Promise.all([
        settingsService.updateThemeSettings(settings.theme),
        settingsService.updateNotificationSettings(settings.notifications),
        settingsService.updateSystemConfiguration(settings.system)
      ]);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      await settingsService.resetToDefault();
      await fetchSettings();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to reset settings:', err);
      setError('Failed to reset settings');
    }
  };

  const handleThemeChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      theme: { ...prev.theme, [key]: value }
    }));
  };

  const handleNotificationChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value }
    }));
  };

  const handleSystemChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      system: { ...prev.system, [key]: value }
    }));
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box m="1.5rem 2.5rem">
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <SettingsIcon fontSize="large" />
        <Typography variant="h3" fontWeight="bold">
          Settings
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Settings saved successfully!
        </Alert>
      )}

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab icon={<PaletteIcon />} label="Theme" />
            <Tab icon={<NotificationIcon />} label="Notifications" />
            <Tab icon={<SecurityIcon />} label="Privacy" />
            <Tab icon={<StorageIcon />} label="System" />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Theme Settings
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Theme Mode</InputLabel>
                <Select
                  value={settings.theme.mode}
                  onChange={(e) => handleThemeChange('mode', e.target.value)}
                  label="Theme Mode"
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="auto">Auto</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Primary Color"
                value={settings.theme.primaryColor}
                onChange={(e) => handleThemeChange('primaryColor', e.target.value)}
                type="color"
                sx={{ mb: 2 }}
              />

              <Typography gutterBottom>
                Font Size: {settings.theme.fontSize}px
              </Typography>
              <Slider
                value={settings.theme.fontSize}
                onChange={(e, value) => handleThemeChange('fontSize', value)}
                min={12}
                max={18}
                step={1}
                marks
                valueLabelDisplay="auto"
              />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Notification Preferences
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.email}
                    onChange={(e) => handleNotificationChange('email', e.target.checked)}
                  />
                }
                label="Email Notifications"
                sx={{ mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.push}
                    onChange={(e) => handleNotificationChange('push', e.target.checked)}
                  />
                }
                label="Push Notifications"
                sx={{ mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.sms}
                    onChange={(e) => handleNotificationChange('sms', e.target.checked)}
                  />
                }
                label="SMS Notifications"
                sx={{ mb: 2 }}
              />

              <FormControl fullWidth>
                <InputLabel>Notification Frequency</InputLabel>
                <Select
                  value={settings.notifications.frequency}
                  onChange={(e) => handleNotificationChange('frequency', e.target.value)}
                  label="Notification Frequency"
                >
                  <MenuItem value="immediate">Immediate</MenuItem>
                  <MenuItem value="hourly">Hourly</MenuItem>
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Privacy Settings
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.privacy.dataSharing}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      privacy: { ...prev.privacy, dataSharing: e.target.checked }
                    }))}
                  />
                }
                label="Allow Data Sharing"
                sx={{ mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.privacy.analytics}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      privacy: { ...prev.privacy, analytics: e.target.checked }
                    }))}
                  />
                }
                label="Analytics Collection"
                sx={{ mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.privacy.cookies}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      privacy: { ...prev.privacy, cookies: e.target.checked }
                    }))}
                  />
                }
                label="Cookie Consent"
                sx={{ mb: 2 }}
              />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                System Configuration
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.system.autoBackup}
                    onChange={(e) => handleSystemChange('autoBackup', e.target.checked)}
                  />
                }
                label="Automatic Backup"
                sx={{ mb: 2 }}
              />

              <Typography gutterBottom>
                Cache Size: {settings.system.cacheSize}MB
              </Typography>
              <Slider
                value={settings.system.cacheSize}
                onChange={(e, value) => handleSystemChange('cacheSize', value)}
                min={50}
                max={500}
                step={50}
                marks
                valueLabelDisplay="auto"
                sx={{ mb: 2 }}
              />

              <FormControl fullWidth>
                <InputLabel>Log Level</InputLabel>
                <Select
                  value={settings.system.logLevel}
                  onChange={(e) => handleSystemChange('logLevel', e.target.value)}
                  label="Log Level"
                >
                  <MenuItem value="error">Error</MenuItem>
                  <MenuItem value="warn">Warning</MenuItem>
                  <MenuItem value="info">Info</MenuItem>
                  <MenuItem value="debug">Debug</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </TabPanel>

        <Divider />

        <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
          <Box display="flex" gap={1}>
            <Chip label={`User: ${user?.name || 'Admin'}`} color="primary" variant="outlined" />
            <Chip label={`Role: ${user?.role || 'Administrator'}`} color="secondary" variant="outlined" />
          </Box>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              onClick={handleReset}
              disabled={saving}
            >
              Reset to Default
            </Button>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default Settings;