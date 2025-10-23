import { apiService } from './apiService';

export const uploadService = {
  // Upload image
  async uploadImage(file) {
    return apiService.uploadFile('/upload/images', file, 'image');
  },

  // Upload document
  async uploadDocument(file) {
    return apiService.uploadFile('/upload/documents', file, 'document');
  },

  // Upload multiple files
  async uploadMultiple(files) {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });
    
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiService.baseURL}/upload/multiple`, {
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
  },

  // Upload profile picture
  async uploadProfilePicture(file) {
    return apiService.uploadFile('/upload/profile-picture', file, 'profilePicture');
  },

  // Upload bulk data
  async uploadBulkData(file, dataType) {
    return apiService.uploadFile(`/upload/bulk/${dataType}`, file, 'data');
  },

  // Get upload status
  async getUploadStatus(uploadId) {
    return apiService.get(`/upload/status/${uploadId}`);
  },

  // Get upload history
  async getUploadHistory() {
    return apiService.get('/upload/history');
  },

  // Delete uploaded file
  async deleteFile(fileId) {
    return apiService.delete(`/upload/files/${fileId}`);
  },

  // Get file info
  async getFileInfo(fileId) {
    return apiService.get(`/upload/files/${fileId}`);
  }
};
