import React, { useState, useEffect, useRef } from 'react';
import styles from './XmlContentViewer.module.css';

interface XmlContentViewerProps {
  content: any;
  fileName: string;
  bucket: string;
  viewMode?: 'tree' | 'raw';
  onViewModeChange?: (mode: 'tree' | 'raw') => void;
}

const XmlContentViewer: React.FC<XmlContentViewerProps> = ({ 
  content, 
  fileName, 
  bucket,
  viewMode = 'tree',
  onViewModeChange
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root']));
  const [searchText, setSearchText] = useState<string>('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState<number>(0);
  
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Get simple file name
  const simpleFileName = fileName.split('/').pop() || fileName;

  // Format XML content as raw string
  const formatRawXml = (obj: any): string => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch (error) {
      console.error('Error formatting XML:', error);
      return 'Error formatting XML content';
    }
  };

  // Process search when search text changes
  useEffect(() => {
    if (!searchText.trim()) {
      setSearchResults([]);
      return;
    }

    // Find paths to all nodes that match the search text
    const results: string[] = [];
    const findInObject = (obj: any, path: string[] = []) => {
      if (!obj) return;

      if (typeof obj === 'string' && obj.toLowerCase().includes(searchText.toLowerCase())) {
        results.push(path.join('.'));
      } else if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          findInObject(item, [...path, `[${index}]`]);
        });
      } else if (typeof obj === 'object') {
        Object.entries(obj).forEach(([key, value]) => {
          findInObject(value, [...path, key]);
        });
      }
    };

    findInObject(content, ['root']);
    setSearchResults(results);
    setCurrentSearchIndex(results.length > 0 ? 0 : -1);
  }, [searchText, content]);

  // Scroll to the current search result
  useEffect(() => {
    if (currentSearchIndex >= 0 && searchResults.length > 0 && contentRef.current) {
      const resultPath = searchResults[currentSearchIndex];
      const element = document.getElementById(`path-${resultPath}`);
      
      if (element) {
        // Expand all parent nodes
        const parts = resultPath.split('.');
        let currentPath = '';
        
        const newExpandedNodes = new Set(expandedNodes);
        for (const part of parts) {
          currentPath = currentPath ? `${currentPath}.${part}` : part;
          newExpandedNodes.add(currentPath);
        }
        setExpandedNodes(newExpandedNodes);
        
        // Wait for rendering after expansion
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add(styles.highlightMatch);
          setTimeout(() => {
            element.classList.remove(styles.highlightMatch);
          }, 2000);
        }, 100);
      }
    }
  }, [currentSearchIndex, searchResults, expandedNodes]);

  // Handle navigation between search results
  const navigateSearch = (direction: 'next' | 'prev') => {
    if (searchResults.length === 0) return;
    
    if (direction === 'next') {
      setCurrentSearchIndex((prev) => (prev + 1) % searchResults.length);
    } else {
      setCurrentSearchIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
    }
  };

  // Toggle a node's expanded state
  const toggleNode = (path: string) => {
    const newExpandedNodes = new Set(expandedNodes);
    if (newExpandedNodes.has(path)) {
      newExpandedNodes.delete(path);
    } else {
      newExpandedNodes.add(path);
    }
    setExpandedNodes(newExpandedNodes);
  };

  // Expand all nodes
  const expandAll = () => {
    const allNodes = new Set<string>();
    
    const findAllPaths = (obj: any, path: string = 'root') => {
      if (!obj || typeof obj !== 'object') return;
      
      allNodes.add(path);
      
      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          if (item && typeof item === 'object') {
            findAllPaths(item, `${path}.[${index}]`);
          }
        });
      } else {
        Object.entries(obj).forEach(([key, value]) => {
          if (value && typeof value === 'object') {
            findAllPaths(value, `${path}.${key}`);
          }
        });
      }
    };
    
    findAllPaths(content);
    setExpandedNodes(allNodes);
  };

  // Collapse all nodes except root
  const collapseAll = () => {
    setExpandedNodes(new Set(['root']));
  };

  // Render a tree node
  const renderTreeNode = (key: string, value: any, path: string, depth: number = 0): JSX.Element => {
    const isExpanded = expandedNodes.has(path);
    const nodeId = `path-${path}`;
    
    // Determine if this node or any child matches the search
    const isSearchMatch = searchText && 
      searchResults.some(result => result === path || result.startsWith(`${path}.`));
    
    // Format display key
    const displayKey = key.startsWith('[') ? key : `"${key}"`;
    
    if (value === null || value === undefined) {
      return (
        <div key={path} className={styles.treeNode} style={{ marginLeft: `${depth * 20}px` }} id={nodeId}>
          <span className={styles.nodeKey}>{displayKey}</span>: <span className={styles.nodeValue}>null</span>
        </div>
      );
    }
    
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      const stringValue = String(value);
      let displayValue = typeof value === 'string' ? `"${value}"` : stringValue;
      
      // Highlight search matches in the value
      if (searchText && typeof value === 'string' && stringValue.toLowerCase().includes(searchText.toLowerCase())) {
        const parts = stringValue.split(new RegExp(`(${searchText})`, 'gi'));
        displayValue = (
          <>
            "
            {parts.map((part, i) => 
              part.toLowerCase() === searchText.toLowerCase() ? 
                <span key={i} className={styles.highlightMatch}>{part}</span> : 
                part
            )}
            "
          </>
        );
      }
      
      return (
        <div key={path} className={styles.treeNode} style={{ marginLeft: `${depth * 20}px` }} id={nodeId}>
          <span className={styles.nodeKey}>{displayKey}</span>: <span className={styles.nodeValue}>{displayValue}</span>
        </div>
      );
    }
    
    if (Array.isArray(value)) {
      return (
        <div key={path} id={nodeId}>
          <div 
            className={styles.treeNode} 
            style={{ marginLeft: `${depth * 20}px` }}
          >
            <button 
              className={styles.nodeToggle}
              onClick={() => toggleNode(path)}
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? '▼' : '►'}
            </button>
            <span className={styles.nodeKey}>{displayKey}</span>: [{isExpanded ? '' : '...'}]
            {isSearchMatch && !isExpanded && (
              <span className={styles.highlightMatch}> (match)</span>
            )}
          </div>
          
          {isExpanded && (
            <div className={styles.nodeChildren}>
              {value.map((item, index) => 
                renderTreeNode(`[${index}]`, item, `${path}.[${index}]`, depth + 1)
              )}
            </div>
          )}
        </div>
      );
    }
    
    // Object
    return (
      <div key={path} id={nodeId}>
        <div 
          className={styles.treeNode} 
          style={{ marginLeft: `${depth * 20}px` }}
        >
          <button 
            className={styles.nodeToggle}
            onClick={() => toggleNode(path)}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? '▼' : '►'}
          </button>
          <span className={styles.nodeKey}>{displayKey}</span>: {isExpanded ? '{' : '{...}'}
          {isSearchMatch && !isExpanded && (
            <span className={styles.highlightMatch}> (match)</span>
          )}
        </div>
        
        {isExpanded && (
          <div className={styles.nodeChildren}>
            {Object.entries(value).map(([childKey, childValue]) => 
              renderTreeNode(childKey, childValue, `${path}.${childKey}`, depth + 1)
            )}
            {isExpanded && <div className={styles.treeNode} style={{ marginLeft: `${depth * 20}px` }}>{'}'}</div>}
          </div>
        )}
      </div>
    );
  };

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already handled by the useEffect
  };

  // Handle view mode change
  const handleViewModeChange = (mode: 'tree' | 'raw') => {
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
  };

  return (
    <div className={styles.viewerContainer}>
      <div className={styles.viewerHeader}>
        <div className={styles.fileInfo}>
          <div className={styles.fileName}>{simpleFileName}</div>
          <div className={styles.filePath}>
            Bucket: {bucket} / {fileName}
          </div>
        </div>
        
        <div className={styles.viewControls}>
          <button 
            className={`${styles.viewModeButton} ${viewMode === 'tree' ? styles.activeViewMode : ''}`}
            onClick={() => handleViewModeChange('tree')}
          >
            Tree View
          </button>
          <button 
            className={`${styles.viewModeButton} ${viewMode === 'raw' ? styles.activeViewMode : ''}`}
            onClick={() => handleViewModeChange('raw')}
          >
            Raw View
          </button>
          {viewMode === 'tree' && (
            <>
              <button 
                className={styles.expandButton}
                onClick={expandAll}
                title="Expand All Nodes"
              >
                Expand All
              </button>
              <button 
                className={styles.collapseButton}
                onClick={collapseAll}
                title="Collapse All Nodes"
              >
                Collapse All
              </button>
            </>
          )}
        </div>
      </div>
      
      <form onSubmit={handleSearch} className={styles.searchBar}>
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search in XML content..."
          className={styles.searchInput}
        />
        
        {searchResults.length > 0 && (
          <>
            <div className={styles.searchInfo}>
              {currentSearchIndex + 1} of {searchResults.length} matches
            </div>
            
            <div className={styles.searchNavigateButtons}>
              <button
                type="button"
                className={styles.prevButton}
                onClick={() => navigateSearch('prev')}
                disabled={searchResults.length <= 1}
              >
                ↑ Prev
              </button>
              <button
                type="button"
                className={styles.nextButton}
                onClick={() => navigateSearch('next')}
                disabled={searchResults.length <= 1}
              >
                ↓ Next
              </button>
            </div>
          </>
        )}
      </form>
      
      <div className={styles.contentWrapper} ref={contentRef}>
        {viewMode === 'raw' ? (
          <pre className={styles.rawContent}>
            {formatRawXml(content)}
          </pre>
        ) : (
          <div className={styles.treeView}>
            {renderTreeNode('root', content, 'root')}
          </div>
        )}
      </div>
    </div>
  );
};

export default XmlContentViewer;