import React, { useState } from 'react';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  prefix: string;
  onPrefixChange: (prefix: string) => void;
  matchCase: boolean;
  onMatchCaseChange: (matchCase: boolean) => void;
  onSearch: () => void;
  onClear: () => void;
  folders?: string[];
  isLoadingFolders?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchTermChange,
  prefix,
  onPrefixChange,
  matchCase,
  onMatchCaseChange,
  onSearch,
  onClear,
  folders = [],
  isLoadingFolders = false
}) => {
  const [showFolderDropdown, setShowFolderDropdown] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  const handleFolderSelect = (folder: string) => {
    onPrefixChange(folder ? `${folder}/` : '');
    setShowFolderDropdown(false);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.searchBar}>
      <div className={styles.inputGroup}>
        <label htmlFor="searchTerm" className={styles.label}>Search Term:</label>
        <input
          id="searchTerm"
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          placeholder="Enter search term..."
          className={styles.input}
          data-testid="search-term-input"
        />
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="prefix" className={styles.label}>Folder Path:</label>
        <div className={styles.prefixInputWrapper}>
          <input
            id="prefix"
            type="text"
            value={prefix}
            onChange={(e) => onPrefixChange(e.target.value)}
            placeholder="folder/subfolder/ (optional)"
            className={styles.input}
            data-testid="prefix-input"
            onFocus={() => setShowFolderDropdown(true)}
          />
          {folders.length > 0 && (
            <button 
              type="button"
              className={styles.folderButton}
              onClick={() => setShowFolderDropdown(!showFolderDropdown)}
              aria-label="Toggle folder list"
            >
              {showFolderDropdown ? '▲' : '▼'}
            </button>
          )}
          
          {showFolderDropdown && folders.length > 0 && (
            <div className={styles.folderDropdown}>
              <div 
                className={styles.folderItem}
                onClick={() => handleFolderSelect('')}
              >
                Root (/)
              </div>
              {folders.map((folder) => (
                <div 
                  key={folder} 
                  className={styles.folderItem}
                  onClick={() => handleFolderSelect(folder)}
                >
                  {folder}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.optionsContainer}>
        <div className={styles.checkboxGroup}>
          <input
            id="matchCase"
            type="checkbox"
            checked={matchCase}
            onChange={(e) => onMatchCaseChange(e.target.checked)}
            className={styles.checkbox}
            data-testid="match-case-checkbox"
          />
          <label htmlFor="matchCase" className={styles.checkboxLabel}>Match Case</label>
        </div>

        {isLoadingFolders && (
          <div className={styles.foldersLoading}>Loading folders...</div>
        )}
      </div>

      <div className={styles.buttonGroup}>
        <button 
          type="submit" 
          className={styles.searchButton}
          disabled={!searchTerm.trim()}
          data-testid="search-button"
        >
          Search
        </button>
        <button 
          type="button" 
          onClick={onClear} 
          className={styles.clearButton}
          data-testid="clear-button"
        >
          Clear
        </button>
      </div>
    </form>
  );
};

export default SearchBar;