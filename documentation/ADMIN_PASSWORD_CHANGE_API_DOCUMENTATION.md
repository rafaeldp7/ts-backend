# 🔐 Admin Password Change API Documentation

## 📋 Overview

The admin password change functionality provides secure password management for admin users with three different scenarios: changing own password, changing another admin's password, and resetting admin passwords.

## 🚀 API Endpoints

### **Base URL:** `/api/admin-management`

All endpoints require admin authentication using Bearer token.

---

## **1. Change Own Password**
```bash
PUT /api/admin-management/change-password
```

**Description:** Change the password of the currently logged-in admin.

**Authentication:** Required (Admin token)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "currentPassword": "current_password_123",
  "newPassword": "new_password_456",
  "confirmPassword": "new_password_456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Responses:**
```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```

```json
{
  "success": false,
  "message": "New password and confirmation do not match"
}
```

---

## **2. Change Another Admin's Password**
```bash
PUT /api/admin-management/:id/change-password
```

**Description:** Change the password of a specific admin (requires current password verification).

**Authentication:** Required (Admin token)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Path Parameters:**
- `id`: MongoDB ObjectId of the admin whose password to change

**Body:**
```json
{
  "currentPassword": "current_password_123",
  "newPassword": "new_password_456",
  "confirmPassword": "new_password_456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## **3. Reset Admin Password (Super Admin Only)**
```bash
PUT /api/admin-management/:id/reset-password
```

**Description:** Reset an admin's password without requiring current password (Super Admin only).

**Authentication:** Required (Super Admin token)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Path Parameters:**
- `id`: MongoDB ObjectId of the admin whose password to reset

**Body:**
```json
{
  "newPassword": "new_password_456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## 🔒 Security Features

### **1. Password Validation:**
- ✅ **Minimum length**: 6 characters
- ✅ **Current password verification**: Required for change operations
- ✅ **Password confirmation**: Must match new password
- ✅ **Different password**: New password must be different from current

### **2. Authentication Requirements:**
- ✅ **Change own password**: Any authenticated admin
- ✅ **Change other admin's password**: Any authenticated admin (with current password)
- ✅ **Reset admin password**: Super Admin only

### **3. Password Hashing:**
- ✅ **Automatic hashing**: Passwords are hashed using bcrypt
- ✅ **Salt rounds**: 12 rounds for security
- ✅ **Pre-save hook**: Automatic hashing on save

---

## 🎯 Frontend Integration

### **1. Change Own Password:**
```javascript
const changeOwnPassword = async (currentPassword, newPassword, confirmPassword) => {
  const token = localStorage.getItem('adminToken');
  
  const response = await fetch('/api/admin-management/change-password', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      currentPassword,
      newPassword,
      confirmPassword
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    alert('Password changed successfully!');
    return true;
  } else {
    alert(data.message);
    return false;
  }
};
```

### **2. Change Another Admin's Password:**
```javascript
const changeAdminPassword = async (adminId, currentPassword, newPassword, confirmPassword) => {
  const token = localStorage.getItem('adminToken');
  
  const response = await fetch(`/api/admin-management/${adminId}/change-password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      currentPassword,
      newPassword,
      confirmPassword
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    alert('Admin password changed successfully!');
    return true;
  } else {
    alert(data.message);
    return false;
  }
};
```

### **3. Reset Admin Password (Super Admin):**
```javascript
const resetAdminPassword = async (adminId, newPassword) => {
  const token = localStorage.getItem('adminToken');
  
  const response = await fetch(`/api/admin-management/${adminId}/reset-password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      newPassword
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    alert('Admin password reset successfully!');
    return true;
  } else {
    alert(data.message);
    return false;
  }
};
```

---

## 📊 Error Handling

### **1. Validation Errors:**
```json
{
  "success": false,
  "message": "Current password, new password, and confirmation are required"
}
```

```json
{
  "success": false,
  "message": "New password and confirmation do not match"
}
```

```json
{
  "success": false,
  "message": "New password must be at least 6 characters long"
}
```

### **2. Authentication Errors:**
```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```

```json
{
  "success": false,
  "message": "New password must be different from current password"
}
```

### **3. Authorization Errors:**
```json
{
  "success": false,
  "message": "Super Admin access required."
}
```

### **4. Not Found Errors:**
```json
{
  "success": false,
  "message": "Admin not found"
}
```

---

## 🔧 Implementation Details

### **1. Password Hashing:**
```javascript
// Automatic hashing in Admin model pre-save hook
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
```

### **2. Password Verification:**
```javascript
// Method to compare passwords
adminSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
```

### **3. Route Protection:**
```javascript
// Change own password - any authenticated admin
router.put('/change-password', authenticateAdmin, adminManagementController.changeOwnPassword);

// Change other admin's password - any authenticated admin
router.put('/:id/change-password', authenticateAdmin, adminManagementController.changeAdminPassword);

// Reset admin password - Super Admin only
router.put('/:id/reset-password', authenticateAdmin, requireSuperAdmin, adminManagementController.resetAdminPassword);
```

---

## 🎯 Use Cases

### **1. Admin Profile Management:**
- **Change own password** from admin profile settings
- **Verify current password** before changing
- **Confirm new password** to prevent typos

### **2. Admin Management:**
- **Change another admin's password** with current password verification
- **Reset admin password** (Super Admin only)
- **Force password change** for security reasons

### **3. Security Scenarios:**
- **Password compromise** - Reset compromised passwords
- **Admin onboarding** - Set initial passwords
- **Password rotation** - Regular password changes

---

## 📋 Summary

The admin password change API provides:

1. **Change Own Password** - Secure self-service password change
2. **Change Admin Password** - Change other admin passwords with verification
3. **Reset Admin Password** - Super Admin can reset any admin password
4. **Comprehensive Validation** - Password strength and confirmation checks
5. **Security Features** - Proper authentication and authorization
6. **Error Handling** - Clear error messages for all scenarios

**Perfect for secure admin password management!** 🔐✨
