# Frontend Implementation Roadmap - TrafficSlight Admin Dashboard

## 🎯 **IMPLEMENTATION REQUIREMENTS**

This document outlines the exact functionality, components, and implementation steps needed to connect the frontend to all backend APIs.

---

## 📋 **IMPLEMENTATION CHECKLIST**

### **Phase 1: Core Infrastructure (Priority: HIGH)**

#### **1.1 Authentication System Implementation**

**Files to Create/Modify:**
- `src/services/authService.js` (NEW)
- `src/contexts/AuthContext.js` (NEW)
- `src/hooks/useAuth.js` (NEW)
- `src/components/ProtectedRoute.jsx` (MODIFY)

**Functionality Required:**
```javascript
// src/services/authService.js
export const authService = {
  // Login functionality
  async login(email, password) {
    const response = await fetch('https://ts-backend-1-jyit.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },

  // Token management
  getToken() {
    return localStorage.getItem('token');
  },

  setToken(token) {
    localStorage.setItem('token', token);
  },

  removeToken() {
    localStorage.removeItem('token');
  },

  // Token validation
  async validateToken() {
    const token = this.getToken();
    if (!token) return false;
    
    const response = await fetch('https://ts-backend-1-jyit.onrender.com/api/auth/verify-token', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.ok;
  }
};
```

**Implementation Steps:**
1. Create authentication service
2. Implement JWT token handling
3. Add token validation
4. Update ProtectedRoute component
5. Add authentication context

#### **1.2 API Service Layer Implementation**

**Files to Create:**
- `src/services/apiService.js` (NEW)
- `src/services/dashboardService.js` (NEW)
- `src/services/searchService.js` (NEW)
- `src/services/exportService.js` (NEW)

**Functionality Required:**
```javascript
// src/services/apiService.js
class ApiService {
  constructor() {
    this.baseURL = 'https://ts-backend-1-jyit.onrender.com/api';
  }

  // Generic API call method
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, config);
    
    if (!response.ok) {
      if (response.status === 401) {
        // Handle unauthorized
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint);
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }
}

export const apiService = new ApiService();
```

**Implementation Steps:**
1. Create base API service
2. Implement generic request method
3. Add error handling
4. Add authentication headers
5. Create specific service classes

---

### **Phase 2: Dashboard Implementation (Priority: HIGH)**

#### **2.1 Dashboard Overview Component**

**Files to Create/Modify:**
- `src/scenes/dashboard/index.jsx` (NEW)
- `src/scenes/overview/index.jsx` (MODIFY)

**Functionality Required:**
```javascript
// src/scenes/dashboard/index.jsx
import React, { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import { dashboardService } from 'services/dashboardService';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getOverview();
      setDashboardData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Users</Typography>
              <Typography variant="h4">{dashboardData?.totalUsers || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Reports</Typography>
              <Typography variant="h4">{dashboardData?.totalReports || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Gas Stations</Typography>
              <Typography variant="h4">{dashboardData?.totalGasStations || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Trips</Typography>
              <Typography variant="h4">{dashboardData?.totalTrips || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
```

**Implementation Steps:**
1. Create dashboard service
2. Implement dashboard overview component
3. Add loading states
4. Add error handling
5. Update overview scene

#### **2.2 Dashboard Service Implementation**

**Files to Create:**
- `src/services/dashboardService.js` (NEW)

**Functionality Required:**
```javascript
// src/services/dashboardService.js
import { apiService } from './apiService';

export const dashboardService = {
  // Get dashboard overview
  async getOverview() {
    return apiService.get('/dashboard/overview');
  },

  // Get dashboard statistics
  async getStats() {
    return apiService.get('/dashboard/stats');
  },

  // Get dashboard analytics
  async getAnalytics(period = '30d') {
    return apiService.get(`/dashboard/analytics?period=${period}`);
  }
};
```

**Implementation Steps:**
1. Create dashboard service
2. Implement overview endpoint
3. Implement stats endpoint
4. Implement analytics endpoint
5. Add error handling

---

### **Phase 3: Search Implementation (Priority: MEDIUM)**

#### **3.1 Search Service Implementation**

**Files to Create:**
- `src/services/searchService.js` (NEW)
- `src/components/SearchBar.jsx` (NEW)
- `src/components/SearchResults.jsx` (NEW)

**Functionality Required:**
```javascript
// src/services/searchService.js
import { apiService } from './apiService';

export const searchService = {
  // Search users
  async searchUsers(query, page = 1, limit = 20) {
    return apiService.get(`/search/users?q=${query}&page=${page}&limit=${limit}`);
  },

  // Search reports
  async searchReports(query, page = 1, limit = 20) {
    return apiService.get(`/search/reports?q=${query}&page=${page}&limit=${limit}`);
  },

  // Search gas stations
  async searchGasStations(query, page = 1, limit = 20) {
    return apiService.get(`/search/gas-stations?q=${query}&page=${page}&limit=${limit}`);
  },

  // Search motorcycles
  async searchMotorcycles(query, page = 1, limit = 20) {
    return apiService.get(`/search/motorcycles?q=${query}&page=${page}&limit=${limit}`);
  },

  // Search trips
  async searchTrips(query, page = 1, limit = 20) {
    return apiService.get(`/search/trips?q=${query}&page=${page}&limit=${limit}`);
  }
};
```

**Implementation Steps:**
1. Create search service
2. Implement search components
3. Add debounced search
4. Add search results display
5. Add pagination

#### **3.2 Search Components Implementation**

**Files to Create:**
- `src/components/SearchBar.jsx` (NEW)
- `src/components/SearchResults.jsx` (NEW)
- `src/scenes/search/index.jsx` (NEW)

**Functionality Required:**
```javascript
// src/components/SearchBar.jsx
import React, { useState, useEffect } from 'react';
import { TextField, Box, IconButton } from '@mui/material';
import { Search } from '@mui/icons-material';

const SearchBar = ({ onSearch, placeholder = "Search..." }) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery) {
      onSearch(debouncedQuery);
    }
  }, [debouncedQuery, onSearch]);

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <TextField
        fullWidth
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        InputProps={{
          endAdornment: (
            <IconButton>
              <Search />
            </IconButton>
          )
        }}
      />
    </Box>
  );
};

export default SearchBar;
```

**Implementation Steps:**
1. Create search bar component
2. Implement debounced search
3. Create search results component
4. Add search scene
5. Add search to navigation

---

### **Phase 4: Export Implementation (Priority: MEDIUM)**

#### **4.1 Export Service Implementation**

**Files to Create:**
- `src/services/exportService.js` (NEW)
- `src/components/ExportButton.jsx` (NEW)

**Functionality Required:**
```javascript
// src/services/exportService.js
import { apiService } from './apiService';

export const exportService = {
  // Export users
  async exportUsers(format = 'csv') {
    const response = await fetch(`${apiService.baseURL}/export/users?format=${format}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) throw new Error('Export failed');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users.${format}`;
    a.click();
    window.URL.revokeObjectURL(url);
  },

  // Export reports
  async exportReports(format = 'csv') {
    const response = await fetch(`${apiService.baseURL}/export/reports?format=${format}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) throw new Error('Export failed');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reports.${format}`;
    a.click();
    window.URL.revokeObjectURL(url);
  },

  // Export gas stations
  async exportGasStations(format = 'csv') {
    const response = await fetch(`${apiService.baseURL}/export/gas-stations?format=${format}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) throw new Error('Export failed');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gas-stations.${format}`;
    a.click();
    window.URL.revokeObjectURL(url);
  },

  // Export trips
  async exportTrips(format = 'csv') {
    const response = await fetch(`${apiService.baseURL}/export/trips?format=${format}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) throw new Error('Export failed');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trips.${format}`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
};
```

**Implementation Steps:**
1. Create export service
2. Implement file download functionality
3. Create export button component
4. Add export to existing scenes
5. Add error handling

---

### **Phase 5: Geographic Data Implementation (Priority: MEDIUM)**

#### **5.1 Geography Service Implementation**

**Files to Create:**
- `src/services/geographyService.js` (NEW)
- `src/components/GeographyChart.jsx` (NEW)

**Functionality Required:**
```javascript
// src/services/geographyService.js
import { apiService } from './apiService';

export const geographyService = {
  // Get all geography data
  async getGeographyData() {
    return apiService.get('/geography');
  },

  // Get barangay data
  async getBarangayData(barangay) {
    return apiService.get(`/geography/barangay/${barangay}`);
  },

  // Get geography statistics
  async getStatistics() {
    return apiService.get('/geography/statistics');
  }
};
```

**Implementation Steps:**
1. Create geography service
2. Implement geography components
3. Add to user management scene
4. Add geographic analytics
5. Add error handling

---

### **Phase 6: Settings Implementation (Priority: LOW)**

#### **6.1 Settings Service Implementation**

**Files to Create:**
- `src/services/settingsService.js` (NEW)
- `src/scenes/settings/index.jsx` (MODIFY)

**Functionality Required:**
```javascript
// src/services/settingsService.js
import { apiService } from './apiService';

export const settingsService = {
  // Get settings
  async getSettings() {
    return apiService.get('/settings');
  },

  // Update settings
  async updateSettings(settings) {
    return apiService.put('/settings', settings);
  },

  // Get theme settings
  async getThemeSettings() {
    return apiService.get('/settings/theme');
  },

  // Update theme settings
  async updateThemeSettings(theme) {
    return apiService.put('/settings/theme', theme);
  }
};
```

**Implementation Steps:**
1. Create settings service
2. Update settings scene
3. Add theme management
4. Add settings persistence
5. Add error handling

---

### **Phase 7: File Upload Implementation (Priority: LOW)**

#### **7.1 File Upload Service Implementation**

**Files to Create:**
- `src/services/uploadService.js` (NEW)
- `src/components/FileUpload.jsx` (NEW)

**Functionality Required:**
```javascript
// src/services/uploadService.js
import { apiService } from './apiService';

export const uploadService = {
  // Upload image
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${apiService.baseURL}/upload/images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });
    
    if (!response.ok) throw new Error('Upload failed');
    return response.json();
  },

  // Upload document
  async uploadDocument(file) {
    const formData = new FormData();
    formData.append('document', file);
    
    const response = await fetch(`${apiService.baseURL}/upload/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });
    
    if (!response.ok) throw new Error('Upload failed');
    return response.json();
  },

  // Upload multiple files
  async uploadMultiple(files) {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });
    
    const response = await fetch(`${apiService.baseURL}/upload/multiple`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });
    
    if (!response.ok) throw new Error('Upload failed');
    return response.json();
  }
};
```

**Implementation Steps:**
1. Create upload service
2. Create file upload component
3. Add file validation
4. Add progress indicators
5. Add error handling

---

### **Phase 8: Notifications Implementation (Priority: LOW)**

#### **8.1 Notifications Service Implementation**

**Files to Create:**
- `src/services/notificationService.js` (NEW)
- `src/components/NotificationCenter.jsx` (NEW)

**Functionality Required:**
```javascript
// src/services/notificationService.js
import { apiService } from './apiService';

export const notificationService = {
  // Get notifications
  async getNotifications() {
    return apiService.get('/notifications');
  },

  // Create notification
  async createNotification(notification) {
    return apiService.post('/notifications', notification);
  },

  // Mark as read
  async markAsRead(id) {
    return apiService.put(`/notifications/${id}/read`);
  },

  // Delete notification
  async deleteNotification(id) {
    return apiService.delete(`/notifications/${id}`);
  }
};
```

**Implementation Steps:**
1. Create notification service
2. Create notification center component
3. Add real-time updates
4. Add notification badges
5. Add error handling

---

## 🔧 **IMPLEMENTATION PRIORITIES**

### **HIGH PRIORITY (Must Implement First)**
1. **Authentication System** - Core functionality
2. **API Service Layer** - Foundation for all other services
3. **Dashboard Implementation** - Main dashboard functionality
4. **Error Handling** - Proper error states throughout app

### **MEDIUM PRIORITY (Implement Second)**
1. **Search Implementation** - User experience enhancement
2. **Export Implementation** - Data export functionality
3. **Geographic Data** - Analytics enhancement

### **LOW PRIORITY (Implement Last)**
1. **Settings Implementation** - Configuration management
2. **File Upload** - File management
3. **Notifications** - User engagement

---

## 📋 **IMPLEMENTATION TIMELINE**

### **Week 1: Core Infrastructure**
- Authentication system
- API service layer
- Error handling
- Loading states

### **Week 2: Dashboard & Search**
- Dashboard implementation
- Search functionality
- Export capabilities

### **Week 3: Advanced Features**
- Geographic data
- Settings management
- File upload

### **Week 4: Polish & Testing**
- Notifications
- Error handling improvements
- Testing and bug fixes

---

## 🧪 **TESTING REQUIREMENTS**

### **Unit Tests**
- Service layer tests
- Component tests
- Utility function tests

### **Integration Tests**
- API integration tests
- Authentication flow tests
- Error handling tests

### **End-to-End Tests**
- User journey tests
- Cross-browser tests
- Performance tests

---

## 📊 **SUCCESS CRITERIA**

### **Functional Requirements**
- [ ] All 80+ API endpoints connected
- [ ] Authentication working properly
- [ ] Search functionality operational
- [ ] Export features working
- [ ] Dashboard displaying data
- [ ] Error handling comprehensive

### **Performance Requirements**
- [ ] Page load times < 2 seconds
- [ ] API response times < 1 second
- [ ] Search results < 500ms
- [ ] Export generation < 5 seconds

### **User Experience Requirements**
- [ ] Loading states for all operations
- [ ] Error messages user-friendly
- [ ] Responsive design
- [ ] Intuitive navigation

---

## 🎯 **FINAL IMPLEMENTATION STATUS**

**Current Status**: 18% Complete (15/80+ endpoints connected)
**Target Status**: 100% Complete (80+ endpoints connected)
**Estimated Time**: 4 weeks
**Priority**: HIGH

**This roadmap provides the exact steps needed to achieve 100% frontend-backend integration!** 🚀
