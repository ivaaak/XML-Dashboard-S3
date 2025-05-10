import React, { useState } from 'react';
import { getSignedUrl } from '../services/apiService';
import styles from './XmlFilesTable.module.css';

interface S3FileInfo {
  key: string;
  bucket: string;
  size?: number;
  lastModified?: Date;
  contentType?: string;
  etag?: string;
}

interface XmlFilesTableProps {
  files: S3FileInfo[];
  onViewFile: (file: S3FileInfo) => void;
  onRefresh: () => void;
  bucket: string;
}

const XmlFilesTable: React.FC<XmlFilesTableProps> = ({ files, onViewFile, onRefresh, bucket }) => {
  const [sortField, setSortField] = useState<keyof S3FileInfo>('key');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState<boolean>(false);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

  // Format file size for display
  const formatSize = (size?: number): string => {
    if (size === undefined) return 'Unknown';
    
    const kb = size / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(2)} KB`;
    }
    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  // Format date for display
  const formatDate = (date?: Date): string => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleString();
  };

  // Handle sort column click
  const handleSort = (field: keyof S3FileInfo) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort files based on current sort field and direction
  const sortedFiles = [...files].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue === undefined) return 1;
    if (bValue === undefined) return -1;
    
    let comparison = 0;
    if (aValue < bValue) {
      comparison = -1;
    } else if (aValue > bValue) {
      comparison = 1;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Get file path parts for display
  const getPathParts = (key: string) => {
    const parts = key.split('/');
    const fileName = parts.pop() || '';
    const path = parts.join('/');
    return { fileName, path };
  };

  // Download file
  const handleDownload = async (file: S3FileInfo) => {
    try {
      setDownloadingFile(file.key);
      const url = await getSignedUrl(file.bucket, file.key);
      
      // Create a temporary link and trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.key.split('/').pop() || 'file.xml');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download file');
    } finally {
      setDownloadingFile(null);
    }
  };

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableHeader}>
        <h2>XML Files</h2>
        <button 
          className={styles.refreshButton}
          onClick={onRefresh}
          disabled={loading}
        >
          Refresh
        </button>
      </div>
      
      {files.length === 0 ? (
        <div className={styles.noFiles}>
          {bucket ? 'No XML files found in this bucket/folder' : 'Please select a bucket to view files'}
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.filesTable}>
            <thead>
              <tr>
                <th onClick={() => handleSort('key')} className={styles.sortableHeader}>
                  File Name
                  {sortField === 'key' && (
                    <span className={styles.sortIcon}>
                      {sortDirection === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </th>
                <th>Path</th>
                <th onClick={() => handleSort('size')} className={styles.sortableHeader}>
                  Size
                  {sortField === 'size' && (
                    <span className={styles.sortIcon}>
                      {sortDirection === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </th>
                <th onClick={() => handleSort('lastModified')} className={styles.sortableHeader}>
                  Last Modified
                  {sortField === 'lastModified' && (
                    <span className={styles.sortIcon}>
                      {sortDirection === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedFiles.map((file) => {
                const { fileName, path } = getPathParts(file.key);
                return (
                  <tr key={file.key}>
                    <td className={styles.fileName}>{fileName}</td>
                    <td className={styles.filePath}>{path || '/'}</td>
                    <td>{formatSize(file.size)}</td>
                    <td>{formatDate(file.lastModified)}</td>
                    <td className={styles.actions}>
                      <button
                        onClick={() => onViewFile(file)}
                        className={styles.viewButton}
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDownload(file)}
                        className={styles.downloadButton}
                        disabled={downloadingFile === file.key}
                      >
                        {downloadingFile === file.key ? 'Downloading...' : 'Download'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <div className={styles.tableFooter}>
        <div className={styles.fileCount}>
          {files.length} {files.length === 1 ? 'file' : 'files'} found
        </div>
      </div>
    </div>
  );
};

export default XmlFilesTable;