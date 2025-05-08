import React, { useState, useEffect } from 'react';
import BucketSelector from './BucketSelector';
import SearchBar from './SearchBar';
import XmlFilesTable from './XmlFilesTable';
import XmlContentViewer from './XmlContentViewer';
import SearchResultsTable from './SearchResultsTable';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { 
  listXmlFiles, 
  getXmlContent, 
  searchXml, 
  getFileStats, 
  getFolderList,
  saveUserPreferences,
  getUserPreferences
} from '../services/apiService';
import { S3FileInfo } from '../types/S3FileInfo';
import { SearchResponse } from '../types/SearchResponse';
import styles from './Dashboard.module.css';

// Create a stats component for showing file statistics
const BucketStats: React.FC<{ 
  stats: {
    totalFiles: number;
    totalSize: number;
    averageSize: number;
    lastModified: Date | undefined;
    folderCounts: Record<string, number>;
  } | null;
  isLoading: boolean;
}> = ({ stats, isLoading }) => {
  if (isLoading) return <p>Loading statistics...</p>;
  if (!stats) return null;

  // Format file size
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Format date
  const formatDate = (date: Date | undefined): string => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleString();
  };

  return (
    <div className={styles.statsContainer}>
      <h3>Bucket Statistics</h3>
      <div className={styles.statsGrid}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Total Files:</span>
          <span className={styles.statValue}>{stats.totalFiles}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Total Size:</span>
          <span className={styles.statValue}>{formatSize(stats.totalSize)}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Average Size:</span>
          <span className={styles.statValue}>{formatSize(stats.averageSize)}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Last Modified:</span>
          <span className={styles.statValue}>{formatDate(stats.lastModified)}</span>
        </div>
      </div>
      
      {Object.keys(stats.folderCounts).length > 0 && (
        <div className={styles.folderStats}>
          <h4>Files by Folder</h4>
          <div className={styles.folderList}>
            {Object.entries(stats.folderCounts)
              .sort(([, countA], [, countB]) => countB - countA)
              .map(([folder, count]) => (
                <div key={folder} className={styles.folderItem}>
                  <span className={styles.folderName}>{folder || 'root'}</span>
                  <span className={styles.folderCount}>{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Create folder breadcrumb component
const FolderBreadcrumb: React.FC<{
  prefix: string;
  onNavigate: (newPrefix: string) => void;
}> = ({ prefix, onNavigate }) => {
  if (!prefix) return null;
  
  const parts = prefix.split('/').filter(Boolean);
  
  return (
    <div className={styles.breadcrumb}>
      <span 
        className={styles.breadcrumbItem} 
        onClick={() => onNavigate('')}
      >
        root
      </span>
      {parts.map((part, index) => {
        const currentPath = parts.slice(0, index + 1).join('/');
        return (
          <React.Fragment key={part}>
            <span className={styles.breadcrumbSeparator}>/</span>
            <span 
              className={styles.breadcrumbItem} 
              onClick={() => onNavigate(currentPath)}
            >
              {part}
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
};

const Dashboard: React.FC = () => {
  // State variables
  const [selectedBucket, setSelectedBucket] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [prefix, setPrefix] = useState<string>('');
  const [matchCase, setMatchCase] = useState<boolean>(false);
  const [files, setFiles] = useState<S3FileInfo[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [selectedFile, setSelectedFile] = useState<S3FileInfo | null>(null);
  const [xmlContent, setXmlContent] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'files' | 'search' | 'content'>('files');
  const [bucketStats, setBucketStats] = useState<{
    totalFiles: number;
    totalSize: number;
    averageSize: number;
    lastModified: Date | undefined;
    folderCounts: Record<string, number>;
  } | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(false);
  const [folders, setFolders] = useState<string[]>([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'tree' | 'raw'>('tree');

  // Load user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const prefs = await getUserPreferences();
        if (prefs.defaultBucket && !selectedBucket) {
          setSelectedBucket(prefs.defaultBucket);
        }
        if (prefs.defaultPrefix) {
          setPrefix(prefs.defaultPrefix);
        }
        if (prefs.viewMode) {
          setViewMode(prefs.viewMode);
        }
      } catch (err) {
        console.error('Failed to load preferences:', err);
      }
    };
    
    loadPreferences();
  }, []);

  // Fetch files when bucket changes
  useEffect(() => {
    if (selectedBucket) {
      fetchFiles();
      fetchBucketStats();
      fetchFolders();
      
      // Save user preference
      saveUserPreferences({
        defaultBucket: selectedBucket
      });
    } else {
      setFiles([]);
      setBucketStats(null);
      setFolders([]);
    }
  }, [selectedBucket, prefix]);

  // Fetch files from API
  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listXmlFiles(selectedBucket, prefix);
      setFiles(response.files);
      setActiveTab('files');
    } catch (err) {
      setError('Failed to fetch files: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  // Fetch bucket statistics
  const fetchBucketStats = async () => {
    if (!selectedBucket) return;
    
    try {
      setIsLoadingStats(true);
      const stats = await getFileStats(selectedBucket);
      setBucketStats(stats);
    } catch (err) {
      console.error('Failed to fetch bucket statistics:', err);
      // Don't show error to user, stats are secondary information
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Fetch folder list
  const fetchFolders = async () => {
    if (!selectedBucket) return;
    
    try {
      setIsLoadingFolders(true);
      const folderList = await getFolderList(selectedBucket);
      setFolders(folderList);
    } catch (err) {
      console.error('Failed to fetch folders:', err);
      // Don't show error to user, folder list is secondary information
    } finally {
      setIsLoadingFolders(false);
    }
  };

  // Handle search submission
  const handleSearch = async () => {
    if (!selectedBucket || !searchTerm.trim()) {
      setError('Please select a bucket and enter a search term');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const results = await searchXml(selectedBucket, searchTerm, prefix, matchCase);
      setSearchResults(results);
      setActiveTab('search');
    } catch (err) {
      setError('Search failed: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  // View XML file content
  const handleViewFile = async (file: S3FileInfo) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedFile(file);
      const content = await getXmlContent(file.bucket, file.key);
      setXmlContent(content);
      setActiveTab('content');
    } catch (err) {
      setError('Failed to fetch XML content: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  // Handle folder navigation
  const handleFolderNavigation = (newPrefix: string) => {
    setPrefix(newPrefix ? `${newPrefix}/` : '');
    
    // Save user preference for folder
    saveUserPreferences({
      defaultPrefix: newPrefix ? `${newPrefix}/` : ''
    });
  };

  // Clear current search results
  const clearSearch = () => {
    setSearchResults(null);
    setSearchTerm('');
    setActiveTab('files');
  };

  // Refresh file list
  const refreshFiles = () => {
    fetchFiles();
    fetchBucketStats();
  };

  // Handle view mode change
  const handleViewModeChange = (mode: 'tree' | 'raw') => {
    setViewMode(mode);
    
    // Save user preference
    saveUserPreferences({
      viewMode: mode
    });
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.controls}>
        <BucketSelector onSelectBucket={setSelectedBucket} selectedBucket={selectedBucket} />
        
        {selectedBucket && (
          <div className={styles.searchControls}>
            <FolderBreadcrumb prefix={prefix} onNavigate={handleFolderNavigation} />
            
            <SearchBar
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              prefix={prefix}
              onPrefixChange={setPrefix}
              matchCase={matchCase}
              onMatchCaseChange={setMatchCase}
              onSearch={handleSearch}
              onClear={clearSearch}
              folders={folders}
              isLoadingFolders={isLoadingFolders}
            />
          </div>
        )}
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className={styles.content}>
          {selectedBucket && bucketStats && (
            <BucketStats stats={bucketStats} isLoading={isLoadingStats} />
          )}
          
          <div className={styles.tabs}>
            <button 
              className={`${styles.tabButton} ${activeTab === 'files' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('files')}
            >
              Files ({files.length})
            </button>
            {searchResults && (
              <button 
                className={`${styles.tabButton} ${activeTab === 'search' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('search')}
              >
                Search Results ({searchResults.matchedFiles})
              </button>
            )}
            {selectedFile && (
              <button 
                className={`${styles.tabButton} ${activeTab === 'content' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('content')}
              >
                XML Content: {selectedFile.key.split('/').pop()}
              </button>
            )}
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'files' && (
              <XmlFilesTable 
                files={files} 
                onViewFile={handleViewFile} 
                onRefresh={refreshFiles}
                bucket={selectedBucket}
                // onFolderClick={handleFolderNavigation}
              />
            )}
            
            {activeTab === 'search' && searchResults && (
              <SearchResultsTable 
                results={searchResults}
                onViewFile={handleViewFile}
                searchTerm={searchTerm}
              />
            )}
            
            {activeTab === 'content' && selectedFile && xmlContent && (
              <XmlContentViewer 
                content={xmlContent}
                fileName={selectedFile.key}
                bucket={selectedFile.bucket}
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;