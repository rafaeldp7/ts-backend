import React, { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  TextField,
  Box,
  Typography
} from '@mui/material';
import {
  Download as DownloadIcon,
  FileDownload as FileDownloadIcon,
  TableChart as TableChartIcon,
  Description as DescriptionIcon,
  GetApp as GetAppIcon
} from '@mui/icons-material';
import { exportService } from '../services/exportService';

const ExportButton = ({ 
  dataType, 
  filters = {}, 
  variant = 'contained',
  size = 'medium',
  fullWidth = false 
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formatDialog, setFormatDialog] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [customFilters, setCustomFilters] = useState(filters);

  const formats = [
    { value: 'csv', label: 'CSV', icon: <TableChartIcon /> },
    { value: 'xlsx', label: 'Excel', icon: <FileDownloadIcon /> },
    { value: 'json', label: 'JSON', icon: <DescriptionIcon /> }
  ];

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleFormatSelect = (format) => {
    setSelectedFormat(format);
    setFormatDialog(true);
    handleClose();
  };

  const handleExport = async () => {
    setLoading(true);
    setError(null);

    try {
      switch (dataType) {
        case 'users':
          await exportService.exportUsers(selectedFormat, customFilters);
          break;
        case 'reports':
          await exportService.exportReports(selectedFormat, customFilters);
          break;
        case 'gas-stations':
          await exportService.exportGasStations(selectedFormat, customFilters);
          break;
        case 'trips':
          await exportService.exportTrips(selectedFormat, customFilters);
          break;
        case 'motorcycles':
          await exportService.exportMotorcycles(selectedFormat, customFilters);
          break;
        case 'fuel-logs':
          await exportService.exportFuelLogs(selectedFormat, customFilters);
          break;
        case 'maintenance':
          await exportService.exportMaintenance(selectedFormat, customFilters);
          break;
        case 'analytics':
          await exportService.exportAnalytics(selectedFormat, customFilters.period || '30d');
          break;
        case 'dashboard':
          await exportService.exportDashboard(selectedFormat);
          break;
        case 'all':
          await exportService.exportAllData(selectedFormat);
          break;
        default:
          throw new Error('Unknown data type');
      }

      setSuccess(true);
      setFormatDialog(false);
    } catch (err) {
      console.error('Export error:', err);
      setError(err.message || 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setFormatDialog(false);
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
    setError(null);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        startIcon={loading ? <CircularProgress size={16} /> : <DownloadIcon />}
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? 'Exporting...' : 'Export Data'}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {formats.map((format) => (
          <MenuItem
            key={format.value}
            onClick={() => handleFormatSelect(format.value)}
          >
            <ListItemIcon>{format.icon}</ListItemIcon>
            <ListItemText>{format.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>

      <Dialog open={formatDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Export {dataType?.toUpperCase()} Data</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Format</InputLabel>
              <Select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                label="Format"
              >
                {formats.map((format) => (
                  <MenuItem key={format.value} value={format.value}>
                    {format.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {dataType === 'analytics' && (
              <TextField
                fullWidth
                label="Period"
                value={customFilters.period || '30d'}
                onChange={(e) => setCustomFilters(prev => ({ ...prev, period: e.target.value }))}
                helperText="e.g., 7d, 30d, 90d, 1y"
                sx={{ mb: 2 }}
              />
            )}

            {dataType !== 'dashboard' && dataType !== 'all' && (
              <TextField
                fullWidth
                label="Date From"
                type="date"
                value={customFilters.dateFrom || ''}
                onChange={(e) => setCustomFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
            )}

            {dataType !== 'dashboard' && dataType !== 'all' && (
              <TextField
                fullWidth
                label="Date To"
                type="date"
                value={customFilters.dateTo || ''}
                onChange={(e) => setCustomFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleExport} 
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <GetAppIcon />}
          >
            {loading ? 'Exporting...' : 'Export'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success">
          Export completed successfully!
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ExportButton;
