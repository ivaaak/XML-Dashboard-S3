import React, { useState } from 'react';
import styles from './SearchResultsTable.module.css';
import { SearchResponse } from '../types/SearchResponse';

interface S3FileInfo {
  key: string;
  bucket: string;
  size?: number;
  lastModified?: Date;
  contentType?: string;
  etag?: string;
}

interface SearchResultsTableProps {
  results: SearchResponse;
  onViewFile: (file: S3FileInfo) => void;
  searchTerm: string;
}

const SearchResultsTable: React.FC<SearchResultsTableProps> = ({
  results,
  onViewFile,
  searchTerm
}) => {
  const [expandedFile, setExpandedFile] = useState<string | null>(null);

  // Toggle expanded state for a file
  const toggleExpand = (key: string) => {
    setExpandedFile(expandedFile === key ? null : key);
  };

  // Get file name from full path
  const getFileName = (filePath: string): string => {
    return filePath.split('/').pop() || filePath;
  };

  // Highlight search term in text
  const highlightText = (text: string, term: string): JSX.Element => {
    if (!term) return <>{text}</>;

    const parts = text.split(new RegExp(`(${term})`, 'gi'));
    
    return (
      <>
        {parts.map((part, index) => 
          part.toLowerCase() === term.toLowerCase() ? 
            <span key={index} className={styles.highlight}>{part}</span> : 
            part
        )}
      </>
    );
  };

  // Truncate long text with ellipsis
  const truncateText = (text: string, maxLength: number = 100): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className={styles.resultsContainer}>
      <div className={styles.resultsHeader}>
        <h2>Search Results</h2>
        <div className={styles.resultsSummary}>
          Found <strong>{results.totalMatches}</strong> matches in <strong>{results.matchedFiles}</strong> files
          {searchTerm && <> for term: <strong>"{searchTerm}"</strong></>}
        </div>
      </div>

      {results.matches.length === 0 ? (
        <div className={styles.noResults}>
          No matches found. Try a different search term or check your search settings.
        </div>
      ) : (
        <div className={styles.resultsList}>
          {results.matches.map((result) => (
            <div key={result.file.key} className={styles.resultItem}>
              <div className={styles.resultHeader}>
                <div className={styles.fileInfo}>
                  <button 
                    className={styles.expandButton}
                    onClick={() => toggleExpand(result.file.key)}
                    aria-label={expandedFile === result.file.key ? "Collapse matches" : "Expand matches"}
                  >
                    {expandedFile === result.file.key ? '▼' : '►'}
                  </button>
                  <span className={styles.fileName}>{getFileName(result.file.key)}</span>
                  <span className={styles.filePath}>{result.file.key}</span>
                </div>
                <div className={styles.matchCount}>
                  {result.matchCount} {result.matchCount === 1 ? 'match' : 'matches'}
                </div>
                <button 
                  className={styles.viewButton} 
                  onClick={() => onViewFile(result.file)}
                >
                  View File
                </button>
              </div>

              {expandedFile === result.file.key && (
                <div className={styles.matchesList}>
                  <table className={styles.matchesTable}>
                    <thead>
                      <tr>
                        <th>XML Path</th>
                        <th>Text</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.matches.map((match, index) => (
                        <tr key={index} className={styles.matchRow}>
                          <td className={styles.matchPath}>{match.path}</td>
                          <td className={styles.matchValue}>
                            {highlightText(truncateText(match.value), searchTerm)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResultsTable;