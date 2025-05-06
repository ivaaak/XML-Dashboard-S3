import axios from 'axios';
import { mockApiService, defaultSavedBuckets } from './mockApiService';
import { S3FileInfo } from '../types/S3FileInfo';
import { SearchResponse } from '../types/SearchResponse';

// Determine if we should use mock data
// You can toggle this with an environment variable or just hardcode for development
const USE_MOCK_DATA = process.env.REACT_APP_USE_MOCK_DATA === 'true' || true; // Set to false in production

// API base URL - can be configured from environment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Error handler helper
const handleApiError = (error: any): never => {
  console.error('API Error:', error);
  if (error.response?.data?.message) {
    throw new Error(error.response.data.message);
  } else if (error.message) {
    throw new Error(error.message);
  } else {
    throw new Error('An unknown error occurred');
  }
};

// List XML files in a bucket
export const listXmlFiles = async (bucket: string, prefix: string = ''): Promise<{ bucket: string; fileCount: number; files: S3FileInfo[] }> => {
  if (USE_MOCK_DATA) {
    return mockApiService.listXmlFiles(bucket, prefix);
  }
  
  try {
    const response = await api.get('/xml/list', {
      params: { bucket, prefix }
    });
    return response.data.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Get XML file content
export const getXmlContent = async (bucket: string, key: string): Promise<any> => {
  if (USE_MOCK_DATA) {
    return mockApiService.getXmlContent(bucket, key);
  }
  
  try {
    const response = await api.get('/xml/content', {
      params: { bucket, key }
    });
    return response.data.data.content;
  } catch (error) {
    return handleApiError(error);
  }
};

// Search within XML files
export const searchXml = async (
  bucket: string,
  term: string,
  prefix?: string,
  matchCase?: boolean,
  limit?: number
): Promise<SearchResponse> => {
  if (USE_MOCK_DATA) {
    // Save search to history for mock integration
    mockApiService.saveSearchHistory({
      term,
      bucket,
      timestamp: Date.now()
    });
    return mockApiService.searchXml(bucket, term, prefix, matchCase, limit);
  }
  
  try {
    const response = await api.post('/xml/search', {
      bucket,
      term,
      prefix,
      matchCase,
      limit
    });
    return response.data.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Get a signed URL for downloading a file
export const getSignedUrl = async (bucket: string, key: string, expiresIn?: number): Promise<string> => {
  if (USE_MOCK_DATA) {
    return mockApiService.getSignedUrl(bucket, key, expiresIn);
  }
  
  try {
    const response = await api.get('/xml/url', {
      params: { bucket, key, expiresIn }
    });
    return response.data.data.url;
  } catch (error) {
    return handleApiError(error);
  }
};

// Upload XML content
export const uploadXmlFile = async (bucket: string, key: string, content: string): Promise<{ success: boolean; message: string }> => {
  if (USE_MOCK_DATA) {
    return mockApiService.uploadXmlFile(bucket, key, content);
  }
  
  try {
    const response = await api.post('/xml/upload', {
      bucket,
      key,
      content
    });
    return {
      success: true,
      message: `File ${key} uploaded successfully to ${bucket}`
    };
  } catch (error) {
    console.error('Error uploading XML file:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to upload file'
    };
  }
};

// Delete an XML file
export const deleteXmlFile = async (bucket: string, key: string): Promise<{ success: boolean; message: string }> => {
  if (USE_MOCK_DATA) {
    return mockApiService.deleteXmlFile(bucket, key);
  }
  
  try {
    await api.delete('/xml/delete', {
      data: { bucket, key }
    });
    return {
      success: true,
      message: `File ${key} deleted successfully from ${bucket}`
    };
  } catch (error) {
    console.error('Error deleting XML file:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete file'
    };
  }
};

// Get folders in a bucket
export const getFolderList = async (bucket: string): Promise<string[]> => {
  if (USE_MOCK_DATA) {
    return mockApiService.getFolderList(bucket);
  }
  
  try {
    const response = await api.get('/xml/folders', {
      params: { bucket }
    });
    return response.data.data.folders;
  } catch (error) {
    console.error('Error fetching folders:', error);
    return [];
  }
};

// Get file statistics
export const getFileStats = async (bucket: string): Promise<{
  totalFiles: number;
  totalSize: number;
  averageSize: number;
  lastModified: Date | undefined;
  folderCounts: Record<string, number>;
}> => {
  if (USE_MOCK_DATA) {
    return mockApiService.getFileStats(bucket);
  }
  
  try {
    const response = await api.get('/xml/stats', {
      params: { bucket }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching file stats:', error);
    return {
      totalFiles: 0,
      totalSize: 0,
      averageSize: 0,
      lastModified: undefined,
      folderCounts: {}
    };
  }
};

// User preferences
export const saveUserPreferences = async (preferences: {
  defaultBucket?: string;
  defaultPrefix?: string;
  viewMode?: 'tree' | 'raw';
  pageSize?: number;
}): Promise<void> => {
  if (USE_MOCK_DATA) {
    return mockApiService.saveUserPreferences(preferences);
  }
  
  try {
    await api.post('/user/preferences', preferences);
  } catch (error) {
    console.error('Error saving user preferences:', error);
    // Fall back to localStorage
    localStorage.setItem('xmlExplorer.userPreferences', JSON.stringify(preferences));
  }
};

export const getUserPreferences = async (): Promise<{
  defaultBucket?: string;
  defaultPrefix?: string;
  viewMode?: 'tree' | 'raw';
  pageSize?: number;
}> => {
  if (USE_MOCK_DATA) {
    return mockApiService.getUserPreferences();
  }
  
  try {
    const response = await api.get('/user/preferences');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    // Fall back to localStorage
    const saved = localStorage.getItem('xmlExplorer.userPreferences');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse user preferences from localStorage', e);
      }
    }
    
    // Default preferences
    return {
      defaultBucket: '',
      defaultPrefix: '',
      viewMode: 'tree',
      pageSize: 15
    };
  }
};

// Search history
export const getSearchHistory = async (): Promise<Array<{ term: string; bucket: string; timestamp: number }>> => {
  if (USE_MOCK_DATA) {
    return mockApiService.getSearchHistory();
  }
  
  try {
    const response = await api.get('/search/history');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching search history:', error);
    return [];
  }
};

// Analytics
export const getSearchAnalytics = async (): Promise<{
  popularTerms: Array<{ term: string; count: number }>;
  popularBuckets: Array<{ bucket: string; count: number }>;
  searchesByDay: Array<{ date: string; count: number }>;
}> => {
  if (USE_MOCK_DATA) {
    return mockApiService.getSearchAnalytics();
  }
  
  try {
    const response = await api.get('/search/analytics');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching search analytics:', error);
    return {
      popularTerms: [],
      popularBuckets: [],
      searchesByDay: []
    };
  }
};

// Get saved buckets - either from mock or from localStorage
export const getSavedBuckets = (): string[] => {
  if (USE_MOCK_DATA) {
    return defaultSavedBuckets;
  }
  
  const saved = localStorage.getItem('savedBuckets');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse saved buckets', e);
    }
  }
  
  return [];
};

// Export all functions
export default {
  listXmlFiles,
  getXmlContent,
  searchXml,
  getSignedUrl,
  uploadXmlFile,
  deleteXmlFile,
  getFolderList,
  getFileStats,
  saveUserPreferences,
  getUserPreferences,
  getSearchHistory,
  getSearchAnalytics,
  getSavedBuckets
};