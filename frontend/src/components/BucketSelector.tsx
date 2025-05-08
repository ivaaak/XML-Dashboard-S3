import React, { useState, useEffect } from 'react';
import styles from './BucketSelector.module.css';

interface BucketSelectorProps {
  onSelectBucket: (bucket: string) => void;
  selectedBucket: string;
}

const BucketSelector: React.FC<BucketSelectorProps> = ({ onSelectBucket, selectedBucket }) => {
  const [bucketInput, setBucketInput] = useState<string>(selectedBucket);
  const [savedBuckets, setSavedBuckets] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  // Load saved buckets from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('savedBuckets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setSavedBuckets(parsed);
        }
      } catch (e) {
        console.error('Failed to parse saved buckets', e);
      }
    }
  }, []);

  // Save a bucket to localStorage
  const saveBucket = (bucket: string) => {
    if (!bucket || savedBuckets.includes(bucket)) return;
    
    const newSavedBuckets = [...savedBuckets, bucket];
    setSavedBuckets(newSavedBuckets);
    localStorage.setItem('savedBuckets', JSON.stringify(newSavedBuckets));
  };

  // Remove a bucket from localStorage
  const removeBucket = (bucket: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const newSavedBuckets = savedBuckets.filter(b => b !== bucket);
    setSavedBuckets(newSavedBuckets);
    localStorage.setItem('savedBuckets', JSON.stringify(newSavedBuckets));
  };

  // Handle form submission
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (bucketInput.trim()) {
      onSelectBucket(bucketInput.trim());
      saveBucket(bucketInput.trim());
      setIsDropdownOpen(false);
    }
  };

  // Handle bucket selection from dropdown
  const handleBucketSelect = (bucket: string) => {
    setBucketInput(bucket);
    onSelectBucket(bucket);
    setIsDropdownOpen(false);
  };

  return (
    <div className={styles.bucketSelectorContainer}>
      <form onSubmit={handleSubmit} className={styles.bucketForm}>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            value={bucketInput}
            onChange={(e) => setBucketInput(e.target.value)}
            placeholder="Enter S3 bucket name"
            className={styles.bucketInput}
            onFocus={() => setIsDropdownOpen(true)}
          />
          {isDropdownOpen && savedBuckets.length > 0 && (
            <div className={styles.dropdown}>
              {savedBuckets.map((bucket) => (
                <div 
                  key={bucket} 
                  className={styles.dropdownItem}
                  onClick={() => handleBucketSelect(bucket)}
                >
                  <span className={styles.bucketName}>{bucket}</span>
                  <button 
                    type="button"
                    className={styles.removeButton}
                    onClick={(e) => removeBucket(bucket, e)}
                    aria-label={`Remove ${bucket}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <button type="submit" className={styles.connectButton}>
          Connect
        </button>
      </form>
      {selectedBucket && (
        <div className={styles.currentBucket}>
          <span>Current Bucket:</span> 
          <strong>{selectedBucket}</strong>
        </div>
      )}
    </div>
  );
};

export default BucketSelector;