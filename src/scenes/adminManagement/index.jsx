// scenes/adminManagement/index.jsx - Updated to use correct form structure
import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, IconButton, Chip, TextField, Box, Typography, Dialog,
  DialogTitle, DialogContent, DialogActions, FormControl, InputLabel,
  Select, MenuItem, Alert, Grid, Card, CardContent
} from '@mui/material';
import { Edit, Delete, PersonAdd, Search } from '@mui/icons-material';
import { adminService } from '../../services/adminService';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',    // FIXED: Changed from 'name' to 'firstName'
    lastName: '',     // FIXED: Added lastName field
    email: '',
    password: '',
    roleId: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });
  const [error, setError] = useState('');

  const { admin: currentAdmin } = useAdminAuth();

  useEffect(() => {
    fetchAdmins();
    fetchRoles();
  }, [search]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAdmins({
        page: pagination.current,
        search: search || undefined
      });

      if (response.success) {
        setAdmins(response.data.admins);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      setError('Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await adminService.getAdminRoles();
      if (response.success) {
        setRoles(response.data);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      const response = await adminService.createAdmin(formData);
      
      if (response.success) {
        setCreateDialogOpen(false);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          roleId: ''
        });
        fetchAdmins(); // Refresh list
        setError('');
      } else {
        setError(response.error || 'Failed to create admin');
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      setError('Failed to create admin');
    }
  };

  const handleDeactivate = async (adminId) => {
    try {
      const response = await adminService.deactivateAdmin(adminId);
      if (response.success) {
        fetchAdmins(); // Refresh list
      } else {
        setError(response.error || 'Failed to deactivate admin');
      }
    } catch (error) {
      console.error('Error deactivating admin:', error);
      setError('Failed to deactivate admin');
    }
  };

  const handleActivate = async (adminId) => {
    try {
      const response = await adminService.activateAdmin(adminId);
      if (response.success) {
        fetchAdmins(); // Refresh list
      } else {
        setError(response.error || 'Failed to activate admin');
      }
    } catch (error) {
      console.error('Error activating admin:', error);
      setError('Failed to activate admin');
    }
  };

  // Check permissions
  const canManageAdmins = currentAdmin?.role?.permissions?.canManageAdmins;
  const canAssignRoles = currentAdmin?.role?.permissions?.canAssignRoles;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Admin Management</Typography>
        {canManageAdmins && (
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Add Admin
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <TextField
            fullWidth
            label="Search admins"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Login</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography>Loading...</Typography>
                </TableCell>
              </TableRow>
            ) : (
              admins.map((admin) => (
                <TableRow key={admin._id}>
                  <TableCell>{admin.fullName}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Chip label={admin.role?.displayName} color="primary" />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={admin.isActive ? 'Active' : 'Inactive'} 
                      color={admin.isActive ? 'success' : 'error'} 
                    />
                  </TableCell>
                  <TableCell>
                    {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'Never'}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => {/* Edit admin */}}>
                      <Edit />
                    </IconButton>
                    {canManageAdmins && (
                      <IconButton 
                        onClick={() => admin.isActive ? handleDeactivate(admin._id) : handleActivate(admin._id)}
                        color={admin.isActive ? 'error' : 'success'}
                      >
                        <Delete />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Admin Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Admin</DialogTitle>
        <form onSubmit={handleCreateAdmin}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  required
                />
              </Grid>
            </Grid>
            
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              margin="normal"
              required
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.roleId}
                onChange={(e) => setFormData({...formData, roleId: e.target.value})}
                required
              >
                {roles.map((role) => (
                  <MenuItem key={role._id} value={role._id}>
                    {role.displayName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Create Admin
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default AdminManagement;
