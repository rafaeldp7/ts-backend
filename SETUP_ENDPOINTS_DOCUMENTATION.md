# 🔧 Setup Endpoints Documentation

## 📋 Overview

The setup endpoints allow creating the first admin account without authentication. This is useful for initial system setup when no admin accounts exist yet.

## 🚀 API Endpoints

### **1. Check Setup Status**
```bash
GET /api/setup/status
```

**Description:** Check if first admin setup is needed.

**Response:**
```json
{
  "success": true,
  "data": {
    "setupNeeded": true,
    "adminCount": 0,
    "message": "No admin accounts found. First admin setup is required."
  }
}
```

**When setup is not needed:**
```json
{
  "success": true,
  "data": {
    "setupNeeded": false,
    "adminCount": 1,
    "message": "Admin accounts exist. Setup not needed."
  }
}
```

### **2. Get Available Roles**
```bash
GET /api/setup/roles
```

**Description:** Get the 3 available roles for first admin setup.

**Response:**
```json
{
  "success": true,
  "data": {
    "roles": [
      {
        "name": "super_admin",
        "displayName": "Super Admin",
        "level": 100,
        "description": "Full system access with all permissions",
        "permissions": { /* all permissions */ },
        "isActive": true,
        "isSystem": true
      },
      {
        "name": "admin",
        "displayName": "Admin",
        "level": 50,
        "description": "Standard administrative access with limited permissions",
        "permissions": { /* limited permissions */ },
        "isActive": true,
        "isSystem": true
      },
      {
        "name": "moderator",
        "displayName": "Moderator",
        "level": 25,
        "description": "Content moderation and read-only access",
        "permissions": { /* minimal permissions */ },
        "isActive": true,
        "isSystem": true
      }
    ]
  }
}
```

### **3. Create First Admin**
```bash
POST /api/setup/first-admin
```

**Description:** Create the first admin account (only works when no admins exist).

**Request Body:**
```json
{
  "firstName": "Super",
  "lastName": "Admin",
  "email": "admin@trafficslight.com",
  "password": "admin123",
  "role": "super_admin"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "First admin account created successfully",
  "data": {
    "admin": {
      "id": "68fc2ef636ef16587c06c94f",
      "firstName": "Super",
      "lastName": "Admin",
      "email": "admin@trafficslight.com",
      "role": "super_admin",
      "roleInfo": {
        "level": 100,
        "displayName": "Super Admin",
        "permissions": { /* all permissions */ }
      },
      "isActive": true,
      "createdAt": "2025-10-25T01:59:18.993Z"
    }
  }
}
```

**Response (Error - Admins already exist):**
```json
{
  "success": false,
  "message": "Admin accounts already exist. This endpoint is only for creating the first admin account."
}
```

## 🔒 Security Features

### **1. One-Time Use Only**
- ✅ **Only works when no admins exist** - Prevents unauthorized account creation
- ✅ **Automatically disabled** after first admin is created
- ✅ **No authentication required** - Only for initial setup

### **2. Input Validation**
- ✅ **Required fields** - firstName, lastName, email, password
- ✅ **Email format validation** - Must be valid email
- ✅ **Password length** - Minimum 6 characters
- ✅ **Role validation** - Must be one of: super_admin, admin, moderator
- ✅ **Email uniqueness** - Cannot create duplicate emails

### **3. Role Options**
- ✅ **Super Admin** - Full system access (recommended for first admin)
- ✅ **Admin** - Standard administrative access
- ✅ **Moderator** - Content moderation access

## 🎯 Usage Examples

### **Frontend Setup Flow**

#### **1. Check if setup is needed:**
```javascript
const checkSetup = async () => {
  const response = await fetch('/api/setup/status');
  const data = await response.json();
  
  if (data.data.setupNeeded) {
    // Show setup form
    showSetupForm();
  } else {
    // Show login form
    showLoginForm();
  }
};
```

#### **2. Get available roles:**
```javascript
const getRoles = async () => {
  const response = await fetch('/api/setup/roles');
  const data = await response.json();
  
  // Populate role dropdown
  populateRoleDropdown(data.data.roles);
};
```

#### **3. Create first admin:**
```javascript
const createFirstAdmin = async (adminData) => {
  const response = await fetch('/api/setup/first-admin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(adminData)
  });
  
  const result = await response.json();
  
  if (result.success) {
    // Redirect to login or auto-login
    window.location.href = '/admin-login';
  } else {
    // Show error message
    showError(result.message);
  }
};
```

### **Complete Setup Form Example**

```html
<!DOCTYPE html>
<html>
<head>
    <title>Admin Setup</title>
</head>
<body>
    <div id="setup-form" style="display: none;">
        <h2>Create First Admin Account</h2>
        <form id="admin-form">
            <div>
                <label>First Name:</label>
                <input type="text" id="firstName" required>
            </div>
            <div>
                <label>Last Name:</label>
                <input type="text" id="lastName" required>
            </div>
            <div>
                <label>Email:</label>
                <input type="email" id="email" required>
            </div>
            <div>
                <label>Password:</label>
                <input type="password" id="password" required minlength="6">
            </div>
            <div>
                <label>Role:</label>
                <select id="role">
                    <option value="super_admin">Super Admin</option>
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                </select>
            </div>
            <button type="submit">Create Admin Account</button>
        </form>
    </div>

    <div id="login-form" style="display: none;">
        <h2>Admin Login</h2>
        <form id="login-form">
            <div>
                <label>Email:</label>
                <input type="email" id="loginEmail" required>
            </div>
            <div>
                <label>Password:</label>
                <input type="password" id="loginPassword" required>
            </div>
            <button type="submit">Login</button>
        </form>
    </div>

    <script>
        // Check setup status on page load
        window.onload = async () => {
            const response = await fetch('/api/setup/status');
            const data = await response.json();
            
            if (data.data.setupNeeded) {
                document.getElementById('setup-form').style.display = 'block';
            } else {
                document.getElementById('login-form').style.display = 'block';
            }
        };
        
        // Handle admin creation
        document.getElementById('admin-form').onsubmit = async (e) => {
            e.preventDefault();
            
            const adminData = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                role: document.getElementById('role').value
            };
            
            try {
                const response = await fetch('/api/setup/first-admin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(adminData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('Admin account created successfully! You can now login.');
                    window.location.reload();
                } else {
                    alert('Error: ' + result.message);
                }
            } catch (error) {
                alert('Error creating admin account: ' + error.message);
            }
        };
    </script>
</body>
</html>
```

## 🚀 Quick Start Guide

### **1. Check Setup Status**
```bash
curl -X GET http://localhost:5000/api/setup/status
```

### **2. Create First Admin**
```bash
curl -X POST http://localhost:5000/api/setup/first-admin \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Super",
    "lastName": "Admin",
    "email": "admin@trafficslight.com",
    "password": "admin123",
    "role": "super_admin"
  }'
```

### **3. Login with Created Admin**
```bash
curl -X POST http://localhost:5000/api/admin-auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@trafficslight.com",
    "password": "admin123"
  }'
```

## 📋 Error Handling

### **Common Error Responses**

#### **1. Admins Already Exist**
```json
{
  "success": false,
  "message": "Admin accounts already exist. This endpoint is only for creating the first admin account."
}
```

#### **2. Missing Required Fields**
```json
{
  "success": false,
  "message": "First name, last name, email, and password are required"
}
```

#### **3. Invalid Email**
```json
{
  "success": false,
  "message": "Please provide a valid email address"
}
```

#### **4. Password Too Short**
```json
{
  "success": false,
  "message": "Password must be at least 6 characters long"
}
```

#### **5. Invalid Role**
```json
{
  "success": false,
  "message": "Invalid role. Must be one of: super_admin, admin, moderator"
}
```

#### **6. Email Already Exists**
```json
{
  "success": false,
  "message": "An admin with this email already exists"
}
```

## 🎉 Benefits

### **1. Secure Initial Setup**
- ✅ **One-time use only** - Prevents unauthorized access
- ✅ **No authentication required** - Only for first admin
- ✅ **Automatic protection** - Disabled after first admin

### **2. User-Friendly**
- ✅ **Simple API** - Easy to integrate
- ✅ **Clear error messages** - Helpful feedback
- ✅ **Role selection** - Choose appropriate role

### **3. Production Ready**
- ✅ **Input validation** - Secure data handling
- ✅ **Error handling** - Graceful failure management
- ✅ **Status checking** - Know when setup is needed

---

## 🚀 Summary

The setup endpoints provide a secure, user-friendly way to create the first admin account without authentication. Once the first admin is created, the setup endpoints are automatically protected and cannot be used again.

**Perfect for initial system setup and deployment!** ✨
