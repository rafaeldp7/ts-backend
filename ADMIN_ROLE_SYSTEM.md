# 🔐 Admin Role System Documentation

## 📋 Overview

The admin system has been simplified to **3 core roles** with a hierarchical permission structure:

1. **Super Admin** (Level 100) - Full system access
2. **Admin** (Level 50) - Standard administrative access  
3. **Moderator** (Level 25) - Content moderation access

## 🎯 Role Hierarchy

### **1. Super Admin (Level 100)**
- **Full system access** with all permissions
- **Can manage other admins** and assign roles
- **Can access all features** and settings
- **Bypasses all permission checks**

**Permissions:**
- ✅ Create, Read, Update, Delete (All)
- ✅ Manage Admins & Assign Roles
- ✅ Manage Users, Reports, Trips, Gas Stations
- ✅ View Analytics & Export Data
- ✅ Manage System Settings

### **2. Admin (Level 50)**
- **Standard administrative access** with limited permissions
- **Cannot manage other admins** or assign roles
- **Cannot access system settings**

**Permissions:**
- ✅ Create, Read, Update (Limited Delete)
- ❌ Manage Admins & Assign Roles
- ✅ Manage Users, Reports, Trips, Gas Stations
- ✅ View Analytics & Export Data
- ❌ Manage System Settings

### **3. Moderator (Level 25)**
- **Content moderation** and read-only access
- **Limited to content management** only
- **Cannot manage users** or system settings

**Permissions:**
- ❌ Create, Delete (Limited Update)
- ✅ Read (All)
- ❌ Manage Admins & Assign Roles
- ❌ Manage Users
- ✅ Manage Reports & Trips (Limited)
- ❌ Manage Gas Stations
- ✅ View Analytics
- ❌ Export Data & Manage Settings

## 🔧 Technical Implementation

### **Role Model Structure**
```javascript
{
  name: 'super_admin' | 'admin' | 'moderator',
  displayName: 'Super Admin' | 'Admin' | 'Moderator',
  level: 100 | 50 | 25,
  permissions: {
    canCreate: Boolean,
    canRead: Boolean,
    canUpdate: Boolean,
    canDelete: Boolean,
    canManageAdmins: Boolean,
    canAssignRoles: Boolean,
    canManageUsers: Boolean,
    canManageReports: Boolean,
    canManageTrips: Boolean,
    canManageGasStations: Boolean,
    canViewAnalytics: Boolean,
    canExportData: Boolean,
    canManageSettings: Boolean
  },
  isActive: Boolean,
  isSystem: Boolean
}
```

### **Middleware Functions**

#### **Authentication Middleware**
```javascript
authenticateAdmin(req, res, next)
```
- Validates JWT token
- Populates user role and permissions
- Checks if admin is active

#### **Permission Middleware**
```javascript
requirePermission(permission)
```
- Checks specific permission
- Super Admin bypasses all checks
- Returns 403 if insufficient permissions

#### **Role Middleware**
```javascript
requireRole(roleName)
requireSuperAdmin()
requireAdmin()
```
- Checks role level hierarchy
- Super Admin (100) > Admin (50) > Moderator (25)
- Higher levels can access lower level features

## 🚀 Setup Instructions

### **1. Initialize Admin System**
```bash
node setupAdminSystem.js
```

### **2. Default Super Admin Credentials**
- **Email:** `admin@trafficslight.com`
- **Password:** `admin123`

### **3. Environment Variables**
```env
DEFAULT_ADMIN_EMAIL=admin@trafficslight.com
DEFAULT_ADMIN_PASSWORD=admin123
JWT_SECRET=your-secret-key
```

## 📊 API Endpoints

### **Authentication Endpoints**
```bash
POST /api/admin-auth/admin-login
POST /api/admin-auth/register
GET  /api/admin-auth/profile
PUT  /api/admin-auth/profile
PUT  /api/admin-auth/change-password
POST /api/admin-auth/logout
GET  /api/admin-auth/verify-token
```

### **Admin Management Endpoints**
```bash
GET    /api/admin-management/           # Get all admins
GET    /api/admin-management/roles      # Get admin roles
GET    /api/admin-management/stats      # Get admin statistics
GET    /api/admin-management/:id        # Get single admin
POST   /api/admin-management/           # Create new admin
PUT    /api/admin-management/:id        # Update admin
DELETE /api/admin-management/:id        # Delete admin
```

### **Role Management Endpoints**
```bash
GET    /api/admin-management/roles      # Get all roles
POST   /api/admin-management/roles      # Create new role
PUT    /api/admin-management/roles/:id # Update role
DELETE /api/admin-management/roles/:id   # Delete role
```

## 🔒 Security Features

### **Role-Based Access Control (RBAC)**
- **Hierarchical permissions** based on role levels
- **Super Admin bypass** for all permission checks
- **Granular permission control** for each feature

### **Authentication Security**
- **JWT token-based** authentication
- **Password hashing** with bcrypt
- **Token expiration** (7 days default)
- **Active status** checking

### **Permission Validation**
- **Middleware-based** permission checking
- **Role level** validation
- **Feature-specific** access control

## 📈 Usage Examples

### **1. Super Admin Login**
```javascript
const response = await fetch('/api/admin-auth/admin-login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@trafficslight.com',
    password: 'admin123'
  })
});
```

### **2. Create New Admin**
```javascript
const response = await fetch('/api/admin-management/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'admin_role_id'
  })
});
```

### **3. Check Permissions**
```javascript
// Middleware automatically checks permissions
app.get('/api/admin-management/', 
  authenticateAdmin, 
  requirePermission('canManageAdmins'),
  getAdmins
);
```

## 🎯 Role Assignment Strategy

### **For New Organizations:**
1. **Start with Super Admin** - Full access for setup
2. **Create Admin users** - For daily management
3. **Assign Moderators** - For content moderation

### **For Existing Systems:**
1. **Audit current permissions** - Review existing roles
2. **Map to new hierarchy** - Super Admin > Admin > Moderator
3. **Migrate users** - Assign appropriate new roles
4. **Test permissions** - Verify access levels

## 🔧 Customization Options

### **Adding New Permissions**
```javascript
// In AdminRole model
permissions: {
  // ... existing permissions
  canManageNotifications: { type: Boolean, default: false },
  canViewReports: { type: Boolean, default: false }
}
```

### **Creating Custom Roles**
```javascript
// Create role with specific permissions
const customRole = {
  name: 'content_manager',
  displayName: 'Content Manager',
  level: 30,
  permissions: {
    canRead: true,
    canUpdate: true,
    canManageReports: true,
    canManageTrips: true,
    // ... other permissions
  }
};
```

## 📋 Migration Checklist

- ✅ **Updated AdminRole model** with 3 roles
- ✅ **Created setup script** for role initialization
- ✅ **Updated middleware** for role-based access
- ✅ **Tested authentication** with new roles
- ✅ **Verified permissions** work correctly
- ✅ **Documented API endpoints** and usage

## 🎉 Benefits of Simplified System

### **1. Clear Hierarchy**
- **3 distinct levels** instead of complex permission matrix
- **Easy to understand** role assignments
- **Predictable access patterns**

### **2. Simplified Management**
- **Fewer roles to manage** and maintain
- **Clear permission boundaries** for each role
- **Easier user onboarding** and training

### **3. Better Security**
- **Reduced attack surface** with fewer roles
- **Clear permission inheritance** from role levels
- **Easier to audit** and monitor access

### **4. Scalable Design**
- **Easy to add permissions** without breaking existing roles
- **Flexible role assignment** based on organizational needs
- **Future-proof** architecture for growth

---

## 🚀 Quick Start

1. **Run setup script:** `node setupAdminSystem.js`
2. **Login as Super Admin:** Use default credentials
3. **Create additional admins** as needed
4. **Assign appropriate roles** based on responsibilities
5. **Test permissions** to ensure proper access control

**The admin system is now ready for production use with a clean, hierarchical role structure!** ✨
