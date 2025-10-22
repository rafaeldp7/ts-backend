# Backend API Implementation Guide: User Growth Endpoint

## Overview
This document provides comprehensive instructions for implementing the `/api/auth/user-growth` endpoint in your backend to support the TrafficSlight Admin Dashboard's user growth chart functionality.

## Frontend Requirements Analysis

Based on the frontend code in `src/scenes/overview/index.jsx`, the endpoint should:

1. **Endpoint**: `GET /api/auth/user-growth`
2. **Expected Response Format**:
   ```json
   {
     "monthlyData": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
   }
   ```
3. **Data Structure**: Array of 12 numbers representing user registrations for each month (Jan-Dec)
4. **Base URL**: `https://ts-backend-1-jyit.onrender.com`

## Backend Implementation

### 1. Database Schema Requirements

Ensure your user collection/table has a `createdAt` or `registrationDate` field:

```javascript
// MongoDB User Schema Example
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  createdAt: { type: Date, default: Date.now },
  // ... other fields
});
```

```sql
-- SQL User Table Example
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  password VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- ... other fields
);
```

### 2. Node.js/Express Implementation

#### Option A: MongoDB with Mongoose

```javascript
// routes/auth.js or similar route file
const express = require('express');
const User = require('../models/User'); // Adjust path to your User model
const router = express.Router();

// GET /api/auth/user-growth
router.get('/user-growth', async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    
    // Aggregate user registrations by month for current year
    const monthlyData = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(currentYear, 0, 1), // Start of current year
            $lt: new Date(currentYear + 1, 0, 1) // Start of next year
          }
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    // Initialize array with 12 zeros (Jan-Dec)
    const result = new Array(12).fill(0);
    
    // Fill in actual data (month - 1 because array is 0-indexed)
    monthlyData.forEach(item => {
      result[item._id - 1] = item.count;
    });

    res.json({
      monthlyData: result
    });
  } catch (error) {
    console.error('Error fetching user growth data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user growth data',
      message: error.message 
    });
  }
});

module.exports = router;
```

#### Option B: SQL Database (PostgreSQL/MySQL)

```javascript
// routes/auth.js
const express = require('express');
const { Pool } = require('pg'); // For PostgreSQL
// const mysql = require('mysql2/promise'); // For MySQL
const router = express.Router();

// PostgreSQL Implementation
router.get('/user-growth', async (req, res) => {
  try {
    const pool = new Pool({
      // Your database connection config
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });

    const currentYear = new Date().getFullYear();
    
    const query = `
      SELECT 
        EXTRACT(MONTH FROM created_at) as month,
        COUNT(*) as count
      FROM users 
      WHERE created_at >= $1 AND created_at < $2
      GROUP BY EXTRACT(MONTH FROM created_at)
      ORDER BY month
    `;
    
    const result = await pool.query(query, [
      new Date(currentYear, 0, 1),
      new Date(currentYear + 1, 0, 1)
    ]);

    // Initialize array with 12 zeros
    const monthlyData = new Array(12).fill(0);
    
    // Fill in actual data
    result.rows.forEach(row => {
      monthlyData[row.month - 1] = parseInt(row.count);
    });

    res.json({ monthlyData });
    
    await pool.end();
  } catch (error) {
    console.error('Error fetching user growth data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user growth data',
      message: error.message 
    });
  }
});

// MySQL Implementation (alternative)
/*
router.get('/user-growth', async (req, res) => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    const currentYear = new Date().getFullYear();
    
    const [rows] = await connection.execute(`
      SELECT 
        MONTH(created_at) as month,
        COUNT(*) as count
      FROM users 
      WHERE created_at >= ? AND created_at < ?
      GROUP BY MONTH(created_at)
      ORDER BY month
    `, [
      new Date(currentYear, 0, 1),
      new Date(currentYear + 1, 0, 1)
    ]);

    const monthlyData = new Array(12).fill(0);
    rows.forEach(row => {
      monthlyData[row.month - 1] = row.count;
    });

    res.json({ monthlyData });
    
    await connection.end();
  } catch (error) {
    console.error('Error fetching user growth data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user growth data',
      message: error.message 
    });
  }
});
*/

module.exports = router;
```

### 3. Python/Django Implementation

```python
# views.py
from django.http import JsonResponse
from django.db.models import Count
from django.db.models.functions import Extract
from datetime import datetime
from .models import User  # Adjust import path

def user_growth(request):
    try:
        current_year = datetime.now().year
        
        # Get user registrations by month for current year
        monthly_data = User.objects.filter(
            created_at__year=current_year
        ).extra(
            select={'month': 'EXTRACT(month FROM created_at)'}
        ).values('month').annotate(
            count=Count('id')
        ).order_by('month')
        
        # Initialize array with 12 zeros
        result = [0] * 12
        
        # Fill in actual data
        for item in monthly_data:
            result[int(item['month']) - 1] = item['count']
        
        return JsonResponse({'monthlyData': result})
        
    except Exception as e:
        return JsonResponse({
            'error': 'Failed to fetch user growth data',
            'message': str(e)
        }, status=500)
```

### 4. Python/Flask Implementation

```python
# app.py or routes.py
from flask import Flask, jsonify
from sqlalchemy import func, extract
from datetime import datetime
from models import User  # Adjust import path

@app.route('/api/auth/user-growth', methods=['GET'])
def user_growth():
    try:
        current_year = datetime.now().year
        
        # Query user registrations by month
        monthly_data = db.session.query(
            extract('month', User.created_at).label('month'),
            func.count(User.id).label('count')
        ).filter(
            extract('year', User.created_at) == current_year
        ).group_by(
            extract('month', User.created_at)
        ).order_by('month').all()
        
        # Initialize array with 12 zeros
        result = [0] * 12
        
        # Fill in actual data
        for month, count in monthly_data:
            result[int(month) - 1] = count
        
        return jsonify({'monthlyData': result})
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch user growth data',
            'message': str(e)
        }), 500
```

## Testing the Endpoint

### 1. Manual Testing with cURL

```bash
# Test the endpoint
curl -X GET "https://ts-backend-1-jyit.onrender.com/api/auth/user-growth" \
  -H "Content-Type: application/json"
```

### 2. Expected Response Examples

**Successful Response:**
```json
{
  "monthlyData": [5, 12, 8, 15, 22, 18, 25, 30, 28, 35, 42, 38]
}
```

**Error Response:**
```json
{
  "error": "Failed to fetch user growth data",
  "message": "Database connection failed"
}
```

### 3. Frontend Integration Test

Add this to your frontend to test the connection:

```javascript
// Test function to add to your frontend
const testUserGrowth = async () => {
  try {
    const response = await fetch('https://ts-backend-1-jyit.onrender.com/api/auth/user-growth');
    const data = await response.json();
    console.log('User Growth Data:', data);
    return data;
  } catch (error) {
    console.error('Error testing user growth endpoint:', error);
  }
};
```

## Deployment Considerations

### 1. Environment Variables

Ensure these environment variables are set:

```bash
# Database Configuration
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=your-database-name
DB_PORT=your-database-port

# API Configuration
API_BASE_URL=https://ts-backend-1-jyit.onrender.com
```

### 2. CORS Configuration

Make sure your backend allows CORS for your frontend domain:

```javascript
// Express.js CORS setup
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:3000', 'https://your-frontend-domain.com'],
  credentials: true
}));
```

### 3. Error Handling

Implement proper error handling and logging:

```javascript
// Add to your error handling middleware
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});
```

## Performance Optimization

### 1. Database Indexing

Add indexes for better query performance:

```sql
-- PostgreSQL/MySQL
CREATE INDEX idx_users_created_at ON users(created_at);

-- MongoDB
db.users.createIndex({ "createdAt": 1 })
```

### 2. Caching (Optional)

Implement caching for frequently accessed data:

```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes

router.get('/user-growth', async (req, res) => {
  try {
    const cacheKey = 'user-growth-data';
    let monthlyData = cache.get(cacheKey);
    
    if (!monthlyData) {
      // Fetch from database (your existing logic)
      monthlyData = await fetchUserGrowthData();
      cache.set(cacheKey, monthlyData);
    }
    
    res.json({ monthlyData });
  } catch (error) {
    // Error handling
  }
});
```

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Ensure your backend allows requests from your frontend domain
2. **Database Connection**: Verify database credentials and connection string
3. **Date Format**: Ensure your database stores dates in a consistent format
4. **Timezone Issues**: Consider using UTC for consistent date handling

### Debug Steps:

1. Check server logs for errors
2. Test the endpoint directly with Postman or cURL
3. Verify database connection and data
4. Check network requests in browser developer tools

## Additional Endpoints

Consider implementing these related endpoints for a complete dashboard:

```javascript
// Additional useful endpoints
GET /api/auth/user-count          // Total user count
GET /api/auth/new-users-this-month // New users this month
GET /api/reports/count            // Total reports count
GET /api/user-motors/count        // Total motors count
GET /api/motorcycles/count        // Total motorcycle models count
```

This implementation will provide the data needed for your TrafficSlight Admin Dashboard's user growth chart functionality.

## Admin Logging & Role-Based Access Control Implementation

### Overview
This section covers the implementation of admin activity logging, role-based access control, and admin management features for the TrafficSlight Admin Dashboard.

### 1. Database Schema for Admin Management

#### Admin Roles Schema
```javascript
// MongoDB Admin Roles Schema
const adminRoleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // "super_admin", "admin", "viewer"
  permissions: {
    canCreate: { type: Boolean, default: false },
    canRead: { type: Boolean, default: true },
    canUpdate: { type: Boolean, default: false },
    canDelete: { type: Boolean, default: false },
    canManageAdmins: { type: Boolean, default: false },
    canAssignRoles: { type: Boolean, default: false }
  },
  description: String,
  createdAt: { type: Date, default: Date.now }
});

// SQL Admin Roles Table
CREATE TABLE admin_roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  can_create BOOLEAN DEFAULT FALSE,
  can_read BOOLEAN DEFAULT TRUE,
  can_update BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  can_manage_admins BOOLEAN DEFAULT FALSE,
  can_assign_roles BOOLEAN DEFAULT FALSE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Admin Users Schema
```javascript
// MongoDB Admin Users Schema
const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminRole', required: true },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// SQL Admin Users Table
CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role_id INTEGER REFERENCES admin_roles(id),
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  created_by INTEGER REFERENCES admins(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Admin Activity Logs Schema
```javascript
// MongoDB Admin Activity Logs Schema
const adminLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  adminName: { type: String, required: true },
  action: { type: String, required: true }, // "CREATE", "READ", "UPDATE", "DELETE", "LOGIN", "LOGOUT"
  resource: { type: String, required: true }, // "USER", "REPORT", "MOTOR", "ADMIN", etc.
  resourceId: String, // ID of the affected resource
  details: {
    before: mongoose.Schema.Types.Mixed, // Previous state for updates
    after: mongoose.Schema.Types.Mixed,  // New state for updates
    description: String
  },
  ipAddress: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now }
});

// SQL Admin Activity Logs Table
CREATE TABLE admin_activity_logs (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES admins(id),
  admin_name VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL,
  resource VARCHAR(50) NOT NULL,
  resource_id VARCHAR(255),
  details_before JSONB,
  details_after JSONB,
  description TEXT,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Backend Implementation

#### Admin Logging Middleware
```javascript
// middleware/adminLogger.js
const AdminLog = require('../models/AdminLog');

const logAdminActivity = (action, resource, resourceId = null, details = {}) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log the activity after response is sent
      if (req.admin && res.statusCode < 400) {
        const logData = {
          adminId: req.admin.id,
          adminName: req.admin.name,
          action,
          resource,
          resourceId: resourceId || req.params.id,
          details: {
            description: details.description || `${action} ${resource}`,
            before: details.before,
            after: details.after
          },
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent'),
          timestamp: new Date()
        };
        
        AdminLog.create(logData).catch(err => 
          console.error('Failed to log admin activity:', err)
        );
      }
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

module.exports = { logAdminActivity };
```

#### Role-Based Access Control Middleware
```javascript
// middleware/rbac.js
const Admin = require('../models/Admin');
const AdminRole = require('../models/AdminRole');

const checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.admin) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const admin = await Admin.findById(req.admin.id).populate('role');
      
      if (!admin || !admin.isActive) {
        return res.status(403).json({ error: 'Admin account inactive' });
      }

      if (!admin.role.permissions[permission]) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required: permission,
          currentRole: admin.role.name
        });
      }

      req.adminRole = admin.role;
      next();
    } catch (error) {
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

module.exports = { checkPermission };
```

#### Admin Management Routes
```javascript
// routes/adminManagement.js
const express = require('express');
const Admin = require('../models/Admin');
const AdminRole = require('../models/AdminRole');
const AdminLog = require('../models/AdminLog');
const { logAdminActivity } = require('../middleware/adminLogger');
const { checkPermission } = require('../middleware/rbac');
const router = express.Router();

// Get all admins with their roles
router.get('/admins', checkPermission('canRead'), async (req, res) => {
  try {
    const admins = await Admin.find({ isActive: true })
      .populate('role', 'name permissions description')
      .populate('createdBy', 'name email')
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ admins });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admins' });
  }
});

// Get admin roles
router.get('/admin-roles', checkPermission('canRead'), async (req, res) => {
  try {
    const roles = await AdminRole.find().sort({ name: 1 });
    res.json({ roles });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admin roles' });
  }
});

// Create new admin
router.post('/admins', 
  checkPermission('canManageAdmins'),
  logAdminActivity('CREATE', 'ADMIN'),
  async (req, res) => {
    try {
      const { name, email, password, roleId } = req.body;
      
      // Check if email already exists
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      const admin = new Admin({
        name,
        email,
        password, // Should be hashed before saving
        role: roleId,
        createdBy: req.admin.id
      });

      await admin.save();
      
      const populatedAdmin = await Admin.findById(admin._id)
        .populate('role', 'name permissions')
        .select('-password');

      res.status(201).json({ admin: populatedAdmin });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create admin' });
    }
  }
);

// Update admin role
router.put('/admins/:id/role',
  checkPermission('canAssignRoles'),
  logAdminActivity('UPDATE', 'ADMIN'),
  async (req, res) => {
    try {
      const { roleId } = req.body;
      const adminId = req.params.id;

      // Get current admin data for logging
      const currentAdmin = await Admin.findById(adminId).populate('role');
      
      const admin = await Admin.findByIdAndUpdate(
        adminId,
        { role: roleId, updatedAt: new Date() },
        { new: true }
      ).populate('role', 'name permissions');

      if (!admin) {
        return res.status(404).json({ error: 'Admin not found' });
      }

      // Log the role change
      req.logDetails = {
        description: `Role changed from ${currentAdmin.role.name} to ${admin.role.name}`,
        before: { role: currentAdmin.role.name },
        after: { role: admin.role.name }
      };

      res.json({ admin });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update admin role' });
    }
  }
);

// Deactivate admin
router.put('/admins/:id/deactivate',
  checkPermission('canManageAdmins'),
  logAdminActivity('UPDATE', 'ADMIN'),
  async (req, res) => {
    try {
      const admin = await Admin.findByIdAndUpdate(
        req.params.id,
        { isActive: false, updatedAt: new Date() },
        { new: true }
      ).populate('role', 'name');

      if (!admin) {
        return res.status(404).json({ error: 'Admin not found' });
      }

      req.logDetails = {
        description: `Admin ${admin.name} deactivated`,
        after: { isActive: false }
      };

      res.json({ message: 'Admin deactivated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to deactivate admin' });
    }
  }
);

// Get all admin activity logs
router.get('/admin-logs', 
  checkPermission('canRead'),
  async (req, res) => {
    try {
      const { page = 1, limit = 50, adminId, action, resource } = req.query;
      
      const filter = {};
      if (adminId) filter.adminId = adminId;
      if (action) filter.action = action;
      if (resource) filter.resource = resource;

      const logs = await AdminLog.find(filter)
        .populate('adminId', 'name email')
        .sort({ timestamp: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await AdminLog.countDocuments(filter);

      res.json({
        logs,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch admin logs' });
    }
  }
);

// Get current admin's activity logs
router.get('/my-admin-logs', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const logs = await AdminLog.find({ adminId: req.admin.id })
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AdminLog.countDocuments({ adminId: req.admin.id });

    res.json({
      logs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admin logs' });
  }
});

// Create admin role
router.post('/admin-roles',
  checkPermission('canAssignRoles'),
  logAdminActivity('CREATE', 'ADMIN_ROLE'),
  async (req, res) => {
    try {
      const { name, permissions, description } = req.body;
      
      const role = new AdminRole({
        name,
        permissions,
        description
      });

      await role.save();
      res.status(201).json({ role });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create admin role' });
    }
  }
);

module.exports = router;
```

### 3. Frontend Integration

#### Admin Management Scene
```javascript
// src/scenes/adminManagement/index.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert
} from '@mui/material';
import { Edit, Delete, Add, Visibility } from '@mui/icons-material';
import Header from 'components/Header';

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    roleId: ''
  });

  useEffect(() => {
    fetchAdmins();
    fetchRoles();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await fetch('/api/admin-management/admins');
      const data = await response.json();
      setAdmins(data.admins);
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/admin-management/admin-roles');
      const data = await response.json();
      setRoles(data.roles);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleCreateAdmin = async () => {
    try {
      const response = await fetch('/api/admin-management/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        fetchAdmins();
        setOpenDialog(false);
        setFormData({ name: '', email: '', password: '', roleId: '' });
      }
    } catch (error) {
      console.error('Error creating admin:', error);
    }
  };

  const handleUpdateRole = async (adminId, newRoleId) => {
    try {
      const response = await fetch(`/api/admin-management/admins/${adminId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId: newRoleId })
      });
      
      if (response.ok) {
        fetchAdmins();
      }
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const getRoleColor = (roleName) => {
    switch (roleName) {
      case 'super_admin': return 'error';
      case 'admin': return 'primary';
      case 'viewer': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <Box m="1.5rem 2.5rem">
      <Header title="Admin Management" subtitle="Manage admin users and roles" />
      
      <Box mt="20px">
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
          sx={{ mb: 2 }}
        >
          Add New Admin
        </Button>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin._id}>
                  <TableCell>{admin.name}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={admin.role.name} 
                      color={getRoleColor(admin.role.name)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{admin.createdBy?.name || 'System'}</TableCell>
                  <TableCell>
                    {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'Never'}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={admin.isActive ? 'Active' : 'Inactive'} 
                      color={admin.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleUpdateRole(admin._id, 'new_role_id')}>
                      <Edit />
                    </IconButton>
                    <IconButton>
                      <Visibility />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Create Admin Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Create New Admin</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.roleId}
              onChange={(e) => setFormData({...formData, roleId: e.target.value})}
            >
              {roles.map((role) => (
                <MenuItem key={role._id} value={role._id}>
                  {role.name} - {role.description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateAdmin} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminManagement;
```

#### Admin Logs Scene
```javascript
// src/scenes/adminLogs/index.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination
} from '@mui/material';
import Header from 'components/Header';

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    action: '',
    resource: ''
  });

  useEffect(() => {
    fetchLogs();
  }, [currentPage, filters]);

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...filters
      });
      
      const response = await fetch(`/api/admin-management/admin-logs?${params}`);
      const data = await response.json();
      setLogs(data.logs);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE': return 'success';
      case 'UPDATE': return 'primary';
      case 'DELETE': return 'error';
      case 'LOGIN': return 'info';
      case 'LOGOUT': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <Box m="1.5rem 2.5rem">
      <Header title="Admin Activity Logs" subtitle="Track admin actions and activities" />
      
      <Box mt="20px" display="flex" gap={2} mb={2}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Action</InputLabel>
          <Select
            value={filters.action}
            onChange={(e) => setFilters({...filters, action: e.target.value})}
          >
            <MenuItem value="">All Actions</MenuItem>
            <MenuItem value="CREATE">Create</MenuItem>
            <MenuItem value="UPDATE">Update</MenuItem>
            <MenuItem value="DELETE">Delete</MenuItem>
            <MenuItem value="LOGIN">Login</MenuItem>
            <MenuItem value="LOGOUT">Logout</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Resource</InputLabel>
          <Select
            value={filters.resource}
            onChange={(e) => setFilters({...filters, resource: e.target.value})}
          >
            <MenuItem value="">All Resources</MenuItem>
            <MenuItem value="USER">User</MenuItem>
            <MenuItem value="REPORT">Report</MenuItem>
            <MenuItem value="MOTOR">Motor</MenuItem>
            <MenuItem value="ADMIN">Admin</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Admin</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Resource</TableCell>
              <TableCell>Details</TableCell>
              <TableCell>IP Address</TableCell>
              <TableCell>Timestamp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log._id}>
                <TableCell>{log.adminName}</TableCell>
                <TableCell>
                  <Chip 
                    label={log.action} 
                    color={getActionColor(log.action)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{log.resource}</TableCell>
                <TableCell>{log.details.description}</TableCell>
                <TableCell>{log.ipAddress}</TableCell>
                <TableCell>
                  {new Date(log.timestamp).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box display="flex" justifyContent="center" mt={2}>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={(e, page) => setCurrentPage(page)}
        />
      </Box>
    </Box>
  );
};

export default AdminLogs;
```

### 4. Default Admin Roles Setup

```javascript
// scripts/setupDefaultRoles.js
const AdminRole = require('../models/AdminRole');

const setupDefaultRoles = async () => {
  const defaultRoles = [
    {
      name: 'super_admin',
      permissions: {
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: true,
        canManageAdmins: true,
        canAssignRoles: true
      },
      description: 'Full access to all features and admin management'
    },
    {
      name: 'admin',
      permissions: {
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: true,
        canManageAdmins: false,
        canAssignRoles: false
      },
      description: 'Standard admin with CRUD permissions'
    },
    {
      name: 'viewer',
      permissions: {
        canCreate: false,
        canRead: true,
        canUpdate: false,
        canDelete: false,
        canManageAdmins: false,
        canAssignRoles: false
      },
      description: 'Read-only access to dashboard data'
    }
  ];

  for (const role of defaultRoles) {
    await AdminRole.findOneAndUpdate(
      { name: role.name },
      role,
      { upsert: true, new: true }
    );
  }

  console.log('Default admin roles setup completed');
};

module.exports = { setupDefaultRoles };
```

### 5. Frontend Route Updates

Add these routes to your `App.js`:

```javascript
// Add to your existing routes in App.js
<Route path="adminManagement" element={<AdminManagement />} />
<Route path="adminLogs" element={<AdminLogs />} />
```

### 6. API Endpoints Summary

```javascript
// Complete API endpoints for admin management
GET    /api/admin-management/admins              // Get all admins
GET    /api/admin-management/admin-roles         // Get all roles
POST   /api/admin-management/admins              // Create new admin
PUT    /api/admin-management/admins/:id/role     // Update admin role
PUT    /api/admin-management/admins/:id/deactivate // Deactivate admin
GET    /api/admin-management/admin-logs          // Get all admin logs
GET    /api/admin-management/my-admin-logs       // Get current admin's logs
POST   /api/admin-management/admin-roles         // Create new role
```

This implementation provides comprehensive admin management with role-based access control, activity logging, and a complete admin management interface for your TrafficSlight Admin Dashboard.

## Complete Backend API Implementation Guide

### Overview
This section provides a comprehensive list of ALL backend API endpoints required for the TrafficSlight Admin Dashboard based on frontend analysis.

### 1. Authentication & User Management APIs

#### User Authentication
```javascript
// POST /api/auth/login
// POST /api/auth/register
// POST /api/auth/logout
// GET /api/auth/me
// PUT /api/auth/profile
```

#### User Statistics & Analytics
```javascript
// GET /api/auth/user-count
// GET /api/auth/new-users-this-month
// GET /api/auth/user-growth
// GET /api/auth/users
// GET /api/auth/first-user-name
```

### 2. Reports Management APIs

#### Reports CRUD Operations
```javascript
// GET /api/reports
// GET /api/reports/:id
// POST /api/reports
// PUT /api/reports/:id
// DELETE /api/reports/:id
// PUT /api/reports/:id/archive
// PUT /api/reports/:id/verify
// GET /api/reports/count
```

#### Reports Analytics
```javascript
// GET /api/reports/analytics
// GET /api/reports/statistics
// GET /api/reports/geographic-data
```

### 3. Gas Stations Management APIs

#### Gas Stations CRUD
```javascript
// GET /api/gas-stations
// GET /api/gas-stations/:id
// POST /api/gas-stations
// PUT /api/gas-stations/:id
// DELETE /api/gas-stations/:id
// GET /api/gas-stations/count
```

#### Gas Stations Analytics
```javascript
// GET /api/gas-stations/analytics
// GET /api/gas-stations/statistics
// GET /api/gas-stations/price-trends
```

### 4. Motorcycles Management APIs

#### Motorcycles CRUD
```javascript
// GET /api/motorcycles
// GET /api/motorcycles/:id
// POST /api/motorcycles
// PUT /api/motorcycles/:id
// DELETE /api/motorcycles/:id
// GET /api/motorcycles/count
```

#### Motorcycles Analytics
```javascript
// GET /api/motorcycles/analytics
// GET /api/motorcycles/statistics
// GET /api/motorcycles/popular-models
```

### 5. User Motors Management APIs

#### User Motors CRUD
```javascript
// GET /api/user-motors
// GET /api/user-motors/:id
// POST /api/user-motors
// PUT /api/user-motors/:id
// DELETE /api/user-motors/:id
// GET /api/user-motors/count
```

#### User Motors Analytics
```javascript
// GET /api/user-motors/analytics
// GET /api/user-motors/statistics
// GET /api/user-motors/user-distribution
```

### 6. Trips Management APIs

#### Trips CRUD
```javascript
// GET /api/trips
// GET /api/trips/:id
// POST /api/trips
// PUT /api/trips/:id
// DELETE /api/trips/:id
// GET /api/trips/count
```

#### Trips Analytics
```javascript
// GET /api/trips/analytics
// GET /api/trips/statistics
// GET /api/trips/monthly-stats
// GET /api/trips/overall-stats
// GET /api/trips/user/:userId
```

### 7. Admin Management APIs (Already Covered Above)

#### Admin CRUD & Role Management
```javascript
// GET /api/admin-management/admins
// GET /api/admin-management/admin-roles
// POST /api/admin-management/admins
// PUT /api/admin-management/admins/:id/role
// PUT /api/admin-management/admins/:id/deactivate
// GET /api/admin-management/admin-logs
// GET /api/admin-management/my-admin-logs
// POST /api/admin-management/admin-roles
```

### 8. Dashboard & Analytics APIs

#### Overview Dashboard
```javascript
// GET /api/dashboard/overview
// GET /api/dashboard/stats
// GET /api/dashboard/analytics
// GET /api/dashboard/user-growth
// GET /api/dashboard/report-trends
```

#### Geographic Data
```javascript
// GET /api/geography
// GET /api/geography/barangay-data
// GET /api/geography/statistics
```

### 9. File Upload & Media APIs

#### File Management
```javascript
// POST /api/upload/images
// POST /api/upload/documents
// GET /api/upload/:filename
// DELETE /api/upload/:filename
```

### 10. Notification & Communication APIs

#### Notifications
```javascript
// GET /api/notifications
// POST /api/notifications
// PUT /api/notifications/:id/read
// DELETE /api/notifications/:id
```

### 11. System Configuration APIs

#### Settings & Configuration
```javascript
// GET /api/settings
// PUT /api/settings
// GET /api/settings/theme
// PUT /api/settings/theme
```

### 12. Search & Filter APIs

#### Advanced Search
```javascript
// GET /api/search/users
// GET /api/search/reports
// GET /api/search/gas-stations
// GET /api/search/motorcycles
// GET /api/search/trips
```

### 13. Export & Import APIs

#### Data Export
```javascript
// GET /api/export/users
// GET /api/export/reports
// GET /api/export/gas-stations
// GET /api/export/trips
// POST /api/import/users
// POST /api/import/gas-stations
```

### 14. Real-time & WebSocket APIs

#### Real-time Updates
```javascript
// WebSocket /ws/notifications
// WebSocket /ws/reports
// WebSocket /ws/admin-activity
```

### 15. Complete Backend Implementation Structure

#### Project Structure
```
backend/
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── reportController.js
│   ├── gasStationController.js
│   ├── motorcycleController.js
│   ├── userMotorController.js
│   ├── tripController.js
│   ├── adminController.js
│   ├── dashboardController.js
│   └── analyticsController.js
├── models/
│   ├── User.js
│   ├── Report.js
│   ├── GasStation.js
│   ├── Motorcycle.js
│   ├── UserMotor.js
│   ├── Trip.js
│   ├── Admin.js
│   ├── AdminRole.js
│   └── AdminLog.js
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── reports.js
│   ├── gasStations.js
│   ├── motorcycles.js
│   ├── userMotors.js
│   ├── trips.js
│   ├── adminManagement.js
│   ├── dashboard.js
│   └── analytics.js
├── middleware/
│   ├── auth.js
│   ├── adminLogger.js
│   ├── rbac.js
│   ├── validation.js
│   └── errorHandler.js
├── utils/
│   ├── database.js
│   ├── email.js
│   ├── fileUpload.js
│   └── analytics.js
└── app.js
```

### 16. Database Schema Requirements

#### Core Tables/Collections
```sql
-- Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  barangay VARCHAR(100),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- Reports Table
CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL, -- 'traffic', 'accident', 'hazard', 'closure'
  location JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'verified', 'resolved'
  verified_by_admin BOOLEAN DEFAULT FALSE,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gas Stations Table
CREATE TABLE gas_stations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  location JSONB NOT NULL,
  fuel_prices JSONB,
  open_hours VARCHAR(100),
  services_offered TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Motorcycles Table
CREATE TABLE motorcycles (
  id SERIAL PRIMARY KEY,
  model VARCHAR(255) NOT NULL,
  engine_displacement VARCHAR(50),
  power VARCHAR(50),
  torque VARCHAR(50),
  fuel_tank VARCHAR(50),
  fuel_consumption VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Motors Table
CREATE TABLE user_motors (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  motorcycle_id INTEGER REFERENCES motorcycles(id),
  nickname VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trips Table
CREATE TABLE trips (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  start_location JSONB NOT NULL,
  end_location JSONB NOT NULL,
  distance DECIMAL(10,2),
  duration INTEGER, -- in minutes
  fuel_consumed DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 17. Environment Variables Required

```bash
# Database Configuration
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=your-database-name
DB_PORT=your-database-port

# API Configuration
API_BASE_URL=https://ts-backend-1-jyit.onrender.com
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Redis Configuration (for caching)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Google Maps API
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,https://your-frontend-domain.com
```

### 18. Production Deployment Checklist

#### Backend Deployment Requirements
- [ ] Database setup (PostgreSQL/MongoDB)
- [ ] Environment variables configured
- [ ] SSL certificate installed
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Logging system configured
- [ ] Error handling middleware
- [ ] Authentication middleware
- [ ] File upload handling
- [ ] Database indexing
- [ ] Caching strategy
- [ ] Monitoring and alerting
- [ ] Backup strategy
- [ ] Security headers
- [ ] API documentation

#### Performance Optimization
- [ ] Database connection pooling
- [ ] Query optimization
- [ ] Caching implementation
- [ ] CDN for static files
- [ ] Compression middleware
- [ ] Image optimization
- [ ] API rate limiting
- [ ] Database indexing

### 19. API Testing Endpoints

#### Test All Endpoints
```bash
# Authentication
curl -X POST "https://ts-backend-1-jyit.onrender.com/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@trafficslight.com","password":"admin123"}'

# User Growth
curl -X GET "https://ts-backend-1-jyit.onrender.com/api/auth/user-growth"

# Reports
curl -X GET "https://ts-backend-1-jyit.onrender.com/api/reports"

# Gas Stations
curl -X GET "https://ts-backend-1-jyit.onrender.com/api/gas-stations"

# Admin Management
curl -X GET "https://ts-backend-1-jyit.onrender.com/api/admin-management/admins"
```

This comprehensive guide covers ALL the backend API endpoints needed for your TrafficSlight Admin Dashboard to function in production.
