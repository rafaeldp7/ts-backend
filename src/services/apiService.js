// Base API service for TrafficSlight Admin Dashboard
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ts-backend-1-jyit.onrender.com/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic API call method with comprehensive error handling
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

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      // Handle different response types
      if (!response.ok) {
        if (response.status === 401) {
          // Handle unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          window.location.href = '/login';
          throw new Error('Unauthorized - Please login again');
        }
        
        if (response.status === 403) {
          throw new Error('Forbidden - Insufficient permissions');
        }
        
        if (response.status === 404) {
          throw new Error('Resource not found');
        }
        
        if (response.status >= 500) {
          throw new Error('Server error - Please try again later');
        }
        
        // Try to get error message from response
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || `API Error: ${response.status}`);
        } catch (parseError) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
      }
      
      // Handle different content types
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else if (contentType && contentType.includes('text/')) {
        return await response.text();
      } else {
        // For file downloads or other binary content
        return response;
      }
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(fullEndpoint);
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // PATCH request
  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }

  // File upload request
  async uploadFile(endpoint, file, fieldName = 'file') {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append(fieldName, file);

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Upload failed');
    }

    return await response.json();
  }

  // Download file
  async downloadFile(endpoint, filename) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });

    if (!response.ok) {
      throw new Error('Download failed');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export const apiService = new ApiService();
