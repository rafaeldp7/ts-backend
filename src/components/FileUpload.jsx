import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Description as FileIcon,
  Image as ImageIcon,
  TableChart as DataIcon
} from '@mui/icons-material';
import { uploadService } from '../services/uploadService';

const FileUpload = ({ 
  accept = '*/*',
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB
  onUploadComplete,
  uploadType = 'general'
}) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const validFiles = [];
    const errors = [];

    selectedFiles.forEach(file => {
      if (file.size > maxSize) {
        errors.push(`${file.name} is too large (max ${maxSize / 1024 / 1024}MB)`);
        return;
      }

      if (accept !== '*/*' && !file.type.match(accept.replace('*', '.*'))) {
        errors.push(`${file.name} is not a supported file type`);
        return;
      }

      validFiles.push({
        id: Date.now() + Math.random(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'pending'
      });
    });

    if (errors.length > 0) {
      setError(errors.join(', '));
    }

    if (validFiles.length > 0) {
      setFiles(prev => multiple ? [...prev, ...validFiles] : validFiles);
      setError(null);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const uploadPromises = files.map(async (fileItem) => {
        setUploadProgress(prev => ({ ...prev, [fileItem.id]: 0 }));

        try {
          let result;
          switch (uploadType) {
            case 'image':
              result = await uploadService.uploadImage(fileItem.file);
              break;
            case 'document':
              result = await uploadService.uploadDocument(fileItem.file);
              break;
            case 'profile-picture':
              result = await uploadService.uploadProfilePicture(fileItem.file);
              break;
            case 'bulk-data':
              result = await uploadService.uploadBulkData(fileItem.file, 'users');
              break;
            default:
              result = await uploadService.uploadMultiple([fileItem.file]);
          }

          setUploadProgress(prev => ({ ...prev, [fileItem.id]: 100 }));
          
          return {
            ...fileItem,
            status: 'success',
            result
          };
        } catch (err) {
          setUploadProgress(prev => ({ ...prev, [fileItem.id]: 0 }));
          return {
            ...fileItem,
            status: 'error',
            error: err.message
          };
        }
      });

      const results = await Promise.all(uploadPromises);
      setFiles(results);

      const successCount = results.filter(r => r.status === 'success').length;
      const errorCount = results.filter(r => r.status === 'error').length;

      if (successCount > 0) {
        setSuccess(`Successfully uploaded ${successCount} file(s)`);
        if (onUploadComplete) {
          onUploadComplete(results.filter(r => r.status === 'success'));
        }
      }

      if (errorCount > 0) {
        setError(`Failed to upload ${errorCount} file(s)`);
      }

    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handlePreview = (fileItem) => {
    setSelectedFile(fileItem);
    setPreviewDialog(true);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <ImageIcon />;
    if (fileType.includes('sheet') || fileType.includes('csv')) return <DataIcon />;
    return <FileIcon />;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              multiple={multiple}
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              Choose Files
            </Button>
            <Typography variant="body2" color="textSecondary">
              Max size: {maxSize / 1024 / 1024}MB
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {files.length > 0 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Selected Files ({files.length})
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleUpload}
                  disabled={uploading}
                  startIcon={uploading ? <LinearProgress /> : <UploadIcon />}
                >
                  {uploading ? 'Uploading...' : 'Upload Files'}
                </Button>
              </Box>

              <List>
                {files.map((fileItem) => (
                  <ListItem key={fileItem.id} divider>
                    <ListItemIcon>
                      {getFileIcon(fileItem.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={fileItem.name}
                      secondary={`${formatFileSize(fileItem.size)} • ${fileItem.type}`}
                    />
                    <Box display="flex" alignItems="center" gap={1}>
                      {uploadProgress[fileItem.id] > 0 && uploadProgress[fileItem.id] < 100 && (
                        <Box width={100}>
                          <LinearProgress 
                            variant="determinate" 
                            value={uploadProgress[fileItem.id]} 
                          />
                        </Box>
                      )}
                      {getStatusIcon(fileItem.status)}
                      <Chip
                        label={fileItem.status}
                        color={getStatusColor(fileItem.status)}
                        size="small"
                        variant="outlined"
                      />
                      <IconButton
                        onClick={() => handlePreview(fileItem)}
                        size="small"
                      >
                        <Description />
                      </IconButton>
                      <IconButton
                        onClick={() => handleRemoveFile(fileItem.id)}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog open={previewDialog} onClose={() => setPreviewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>File Preview</DialogTitle>
        <DialogContent>
          {selectedFile && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedFile.name}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Size: {formatFileSize(selectedFile.size)} • Type: {selectedFile.type}
              </Typography>
              {selectedFile.status === 'error' && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {selectedFile.error}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FileUpload;
