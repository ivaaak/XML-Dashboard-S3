import { S3FileInfo } from "../types/S3FileInfo";
import { SearchResponse } from "../types/SearchResponse";

// Mock XML content
const mockXmlContent = {
  "report": {
    "title": "Monthly Sales Report",
    "period": "January 2025",
    "generated_date": "2025-02-01T10:30:00",
    "department": "Sales",
    "author": "John Smith",
    "summary": {
      "total_sales": "1245000",
      "growth": "5.7",
      "top_product": "Widget Pro X9"
    },
    "regions": {
      "region": [
        {
          "name": "North America",
          "sales": "450000",
          "growth": "7.2",
          "representatives": {
            "representative": [
              {
                "name": "Alice Johnson",
                "id": "AJ001",
                "sales": "230000",
                "commission": "23000"
              },
              {
                "name": "Bob Williams",
                "id": "BW002",
                "sales": "220000",
                "commission": "22000"
              }
            ]
          }
        },
        {
          "name": "Europe",
          "sales": "375000",
          "growth": "4.5",
          "representatives": {
            "representative": [
              {
                "name": "Charlie Brown",
                "id": "CB003",
                "sales": "190000",
                "commission": "19000"
              },
              {
                "name": "Diana Miller",
                "id": "DM004",
                "sales": "185000",
                "commission": "18500"
              }
            ]
          }
        },
        {
          "name": "Asia Pacific",
          "sales": "325000",
          "growth": "9.1",
          "representatives": {
            "representative": [
              {
                "name": "Edward Chen",
                "id": "EC005",
                "sales": "175000",
                "commission": "17500"
              },
              {
                "name": "Fiona Wang",
                "id": "FW006",
                "sales": "150000",
                "commission": "15000"
              }
            ]
          }
        },
        {
          "name": "Latin America",
          "sales": "95000",
          "growth": "2.3",
          "representatives": {
            "representative": [
              {
                "name": "Gabriel Rodriguez",
                "id": "GR007",
                "sales": "95000",
                "commission": "9500"
              }
            ]
          }
        }
      ]
    },
    "products": {
      "product": [
        {
          "name": "Widget Pro X9",
          "id": "WPX9",
          "category": "Hardware",
          "sales": "450000",
          "units": "2250"
        },
        {
          "name": "SuperApp Premium",
          "id": "SAP1",
          "category": "Software",
          "sales": "325000",
          "units": "1625"
        },
        {
          "name": "CloudStore Enterprise",
          "id": "CSE1",
          "category": "Services",
          "sales": "275000",
          "units": "110"
        },
        {
          "name": "DataSecure Ultimate",
          "id": "DSU2",
          "category": "Software",
          "sales": "195000",
          "units": "650"
        }
      ]
    },
    "notes": "This was an exceptional month for the Asia Pacific region. The Widget Pro X9 continues to exceed expectations in all markets."
  }
};

// Mock customers data
const mockCustomersXml = {
  "customers": {
    "customer": [
      {
        "id": "C1001",
        "name": "Acme Corporation",
        "industry": "Manufacturing",
        "contact": {
          "name": "John Davis",
          "email": "jdavis@acme.example.com",
          "phone": "555-123-4567"
        },
        "address": {
          "street": "123 Main Street",
          "city": "Anytown",
          "state": "CA",
          "zip": "90210",
          "country": "USA"
        },
        "contracts": {
          "contract": [
            {
              "id": "CNT-5678",
              "type": "Annual",
              "value": "250000",
              "start_date": "2024-06-01",
              "end_date": "2025-05-31"
            }
          ]
        }
      },
      {
        "id": "C1002",
        "name": "TechNova Solutions",
        "industry": "Technology",
        "contact": {
          "name": "Sarah Lee",
          "email": "slee@technova.example.com",
          "phone": "555-987-6543"
        },
        "address": {
          "street": "456 Innovation Drive",
          "city": "Tech City",
          "state": "WA",
          "zip": "98001",
          "country": "USA"
        },
        "contracts": {
          "contract": [
            {
              "id": "CNT-8765",
              "type": "Monthly",
              "value": "12000",
              "start_date": "2024-10-15",
              "end_date": "2025-10-14",
              "auto_renewal": "true"
            }
          ]
        }
      },
      {
        "id": "C1003",
        "name": "Global Financial Partners",
        "industry": "Finance",
        "contact": {
          "name": "Robert Chen",
          "email": "rchen@gfp.example.com",
          "phone": "555-456-7890"
        },
        "address": {
          "street": "789 Money Lane",
          "city": "Banksville",
          "state": "NY",
          "zip": "10001",
          "country": "USA"
        },
        "contracts": {
          "contract": [
            {
              "id": "CNT-9012",
              "type": "Annual",
              "value": "500000",
              "start_date": "2024-01-01",
              "end_date": "2024-12-31"
            },
            {
              "id": "CNT-9013",
              "type": "Premium Support",
              "value": "100000",
              "start_date": "2024-01-01",
              "end_date": "2025-12-31"
            }
          ]
        }
      }
    ]
  }
};

// Mock inventory data
const mockInventoryXml = {
  "inventory": {
    "warehouse": [
      {
        "id": "WH001",
        "name": "Main Distribution Center",
        "location": {
          "city": "Memphis",
          "state": "TN",
          "country": "USA"
        },
        "items": {
          "item": [
            {
              "sku": "WPX9-128",
              "name": "Widget Pro X9 - 128GB",
              "category": "Hardware",
              "quantity": "1580",
              "unit_price": "199.99",
              "reorder_level": "500"
            },
            {
              "sku": "WPX9-256",
              "name": "Widget Pro X9 - 256GB",
              "category": "Hardware",
              "quantity": "950",
              "unit_price": "249.99",
              "reorder_level": "350"
            },
            {
              "sku": "SAP1-STD",
              "name": "SuperApp Premium - Standard",
              "category": "Software",
              "quantity": "2300",
              "unit_price": "99.99",
              "reorder_level": "1000"
            }
          ]
        }
      },
      {
        "id": "WH002",
        "name": "West Coast Facility",
        "location": {
          "city": "Sacramento",
          "state": "CA",
          "country": "USA"
        },
        "items": {
          "item": [
            {
              "sku": "WPX9-128",
              "name": "Widget Pro X9 - 128GB",
              "category": "Hardware",
              "quantity": "750",
              "unit_price": "199.99",
              "reorder_level": "250"
            },
            {
              "sku": "DSU2-ENT",
              "name": "DataSecure Ultimate - Enterprise",
              "category": "Software",
              "quantity": "320",
              "unit_price": "299.99",
              "reorder_level": "100"
            }
          ]
        }
      }
    ]
  }
};

// Create mock file list
const mockFiles: S3FileInfo[] = [
  {
    key: 'reports/monthly/sales_report_jan_2025.xml',
    bucket: 'company-data',
    size: 15240,
    lastModified: new Date('2025-02-01T10:35:00Z'),
    contentType: 'application/xml',
  },
  {
    key: 'reports/monthly/sales_report_feb_2025.xml',
    bucket: 'company-data',
    size: 16120,
    lastModified: new Date('2025-03-01T09:42:00Z'),
    contentType: 'application/xml',
  },
  {
    key: 'customers/client_data.xml',
    bucket: 'company-data',
    size: 24830,
    lastModified: new Date('2025-01-15T14:22:00Z'),
    contentType: 'application/xml',
  },
  {
    key: 'inventory/warehouse_stock.xml',
    bucket: 'company-data',
    size: 18650,
    lastModified: new Date('2025-02-20T11:15:00Z'),
    contentType: 'application/xml',
  },
  {
    key: 'configs/system_settings.xml',
    bucket: 'company-data',
    size: 3240,
    lastModified: new Date('2024-12-15T16:05:00Z'),
    contentType: 'application/xml',
  },
  {
    key: 'reports/quarterly/q1_2025_summary.xml',
    bucket: 'company-data',
    size: 28750,
    lastModified: new Date('2025-04-05T13:30:00Z'),
    contentType: 'application/xml',
  },
  {
    key: 'archive/2024/december/end_of_year.xml',
    bucket: 'company-data',
    size: 42310,
    lastModified: new Date('2025-01-02T08:45:00Z'),
    contentType: 'application/xml',
  }
];

// Mock search results
const createMockSearchResults = (searchTerm: string): SearchResponse => {
  // Filter files that would match the search term
  const relevantFiles = mockFiles.filter(file => {
    // Simple logic to determine if a file might contain the search term
    const fileName = file.key.toLowerCase();
    return searchTerm.toLowerCase().split(' ').some(term => fileName.includes(term));
  });

  // Generate mock matches
  const matches = relevantFiles.map(file => {
    let matchData;
    let matchCount = Math.floor(Math.random() * 5) + 1; // 1-5 matches

    // Assign appropriate content based on the file key
    if (file.key.includes('sales_report')) {
      matchData = createMatchesFromObject(mockXmlContent, searchTerm, matchCount);
    } else if (file.key.includes('client_data')) {
      matchData = createMatchesFromObject(mockCustomersXml, searchTerm, matchCount);
    } else if (file.key.includes('warehouse_stock')) {
      matchData = createMatchesFromObject(mockInventoryXml, searchTerm, matchCount);
    } else {
      // Generic matches for other files
      matchData = {
        matches: Array(matchCount).fill(null).map((_, i) => ({
          path: `root.section${i + 1}.data`,
          value: `Sample content containing the term ${searchTerm} in context`
        })),
        count: matchCount
      };
    }

    return {
      file,
      matches: matchData.matches,
      matchCount: matchData.count
    };
  });

  return {
    searchTerm,
    totalFiles: mockFiles.length,
    matchedFiles: matches.length,
    totalMatches: matches.reduce((sum, result) => sum + result.matchCount, 0),
    matches
  };
};

// Helper to create matches from a content object
const createMatchesFromObject = (obj: any, searchTerm: string, targetCount: number): { matches: any[], count: number } => {
  const matches: any[] = [];
  const searchTermLower = searchTerm.toLowerCase();
  
  // Convert to string to do simple search
  const objString = JSON.stringify(obj);
  
  // If the term isn't in the object at all, create fake matches
  if (!objString.toLowerCase().includes(searchTermLower)) {
    for (let i = 0; i < targetCount; i++) {
      matches.push({
        path: `root.section${i + 1}.data`,
        value: `This is a mock match containing ${searchTerm}`
      });
    }
    return { matches, count: matches.length };
  }

  // Find paths and values that might contain the term
  const findMatches = (object: any, path: string[] = ['root']): void => {
    if (matches.length >= targetCount) return;
    
    Object.entries(object).forEach(([key, value]) => {
      if (matches.length >= targetCount) return;
      
      const currentPath = [...path, key];
      
      if (typeof value === 'string' && value.toLowerCase().includes(searchTermLower)) {
        matches.push({
          path: currentPath.join('.'),
          value
        });
      } else if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (typeof item === 'object' && item !== null) {
              findMatches(item, [...currentPath, `[${index}]`]);
            }
          });
        } else {
          findMatches(value, currentPath);
        }
      }
    });
  };
  
  findMatches(obj);
  
  // If we didn't find enough real matches, add some fake ones
  while (matches.length < targetCount) {
    matches.push({
      path: `root.section${matches.length + 1}.data`,
      value: `This is a mock match containing ${searchTerm}`
    });
  }
  
  return { matches, count: matches.length };
};

// Helper function to simulate delay
const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Mock API functions
export const listXmlFiles = async (bucket: string, prefix: string = ''): Promise<{ bucket: string, fileCount: number, files: S3FileInfo[] }> => {
  await delay(800); // Simulate network delay
  
  let filteredFiles = [...mockFiles];
  
  // Filter by prefix if provided
  if (prefix) {
    filteredFiles = filteredFiles.filter(file => file.key.startsWith(prefix));
  }
  
  // Always return the same mock bucket
  filteredFiles = filteredFiles.map(file => ({
    ...file,
    bucket
  }));
  
  return {
    bucket,
    fileCount: filteredFiles.length,
    files: filteredFiles
  };
};

export const getXmlContent = async (bucket: string, key: string): Promise<any> => {
  await delay(1000); // Simulate network delay
  
  // Return appropriate content based on file path
  if (key.includes('sales_report')) {
    return mockXmlContent;
  } else if (key.includes('client_data')) {
    return mockCustomersXml;
  } else if (key.includes('warehouse_stock')) {
    return mockInventoryXml;
  } else {
    // Generic structure for other files
    return {
      "root": {
        "metadata": {
          "title":  'title',
          "created": new Date().toISOString(),
          "version": "1.0"
        },
        "content": {
          "section1": {
            "title": "Introduction",
            "text": "This is a mock XML file content for demonstration purposes."
          },
          "section2": {
            "title": "Details",
            "text": "This would contain the actual data in a real application.",
            "items": {
              "item": [
                { "id": "1", "name": "First item", "value": "100" },
                { "id": "2", "name": "Second item", "value": "200" },
                { "id": "3", "name": "Third item", "value": "300" }
              ]
            }
          }
        }
      }
    };
  }
};

export const searchXml = async (
  bucket: string,
  term: string,
  prefix?: string,
  matchCase?: boolean,
  limit?: number
): Promise<SearchResponse> => {
  await delay(1500); // Simulate a more time-consuming search
  
  const results = createMockSearchResults(term);
  
  // Apply prefix filter if provided
  if (prefix) {
    results.matches = results.matches.filter(result => result.file.key.startsWith(prefix));
    results.matchedFiles = results.matches.length;
    results.totalMatches = results.matches.reduce((sum, result) => sum + result.matchCount, 0);
  }
  
  // Apply limit if provided
  if (limit && results.matches.length > limit) {
    results.matches = results.matches.slice(0, limit);
    results.matchedFiles = results.matches.length;
    results.totalMatches = results.matches.reduce((sum, result) => sum + result.matchCount, 0);
  }
  
  return results;
};

export const getSignedUrl = async (bucket: string, key: string, expiresIn?: number): Promise<string> => {
  await delay(500); // Simulate network delay
  
  // Create a fake signed URL
  const base = 'https://example-bucket.s3.amazonaws.com';
  const expiry = Date.now() + (expiresIn || 3600) * 1000;
  const signature = Math.random().toString(36).substring(2, 15);
  
  return `${base}/${encodeURIComponent(key)}?X-Amz-Expires=${expiresIn || 3600}&X-Amz-Signature=${signature}&X-Amz-Date=${expiry}`;
};

// Mock data for specific buckets
const bucketCollections: Record<string, S3FileInfo[]> = {
  'company-data': mockFiles,
  'customer-archive': mockFiles.filter(file => file.key.includes('customer') || file.key.includes('client')),
  'reports-archive': mockFiles.filter(file => file.key.includes('report')),
  'configs-backup': mockFiles.filter(file => file.key.includes('config') || file.key.includes('setting')),
};

// Default saved buckets
export const defaultSavedBuckets = [
  'company-data',
  'customer-archive',
  'reports-archive',
  'configs-backup'
];

// Enhanced API with additional functionality for the dashboard
export const mockApiService = {
  // Core API functions
  listXmlFiles,
  getXmlContent,
  searchXml,
  getSignedUrl,

  // Dashboard-specific functions
  getBucketList: async (): Promise<string[]> => {
    await delay(600);
    return Object.keys(bucketCollections);
  },

  getFolderList: async (bucket: string): Promise<string[]> => {
    await delay(700);
    
    // Extract unique folder paths from file keys
    const files = bucketCollections[bucket] || mockFiles;
    const folders = new Set<string>();
    
    files.forEach(file => {
      const parts = file.key.split('/');
      let path = '';
      
      // Build folder paths
      for (let i = 0; i < parts.length - 1; i++) {
        path = path ? `${path}/${parts[i]}` : parts[i];
        folders.add(path);
      }
    });
    
    return Array.from(folders).sort();
  },

  getFileStats: async (bucket: string): Promise<{ 
    totalFiles: number, 
    totalSize: number, 
    averageSize: number,
    lastModified: Date | undefined,
    folderCounts: Record<string, number>
  }> => {
    await delay(800);
    
    const files = bucketCollections[bucket] || mockFiles;
    const folderCounts: Record<string, number> = {};
    
    // Calculate various statistics
    let totalSize = 0;
    let lastModified: Date | undefined = undefined;
    
    files.forEach(file => {
      // Total size
      totalSize += file.size || 0;
      
      // Last modified
      if (!lastModified || (file.lastModified && file.lastModified > lastModified)) {
        lastModified = file.lastModified;
      }
      
      // Folder counts
      const folderPath = file.key.split('/').slice(0, -1).join('/');
      if (folderPath) {
        folderCounts[folderPath] = (folderCounts[folderPath] || 0) + 1;
      } else {
        folderCounts['root'] = (folderCounts['root'] || 0) + 1;
      }
    });
    
    return {
      totalFiles: files.length,
      totalSize,
      averageSize: files.length ? totalSize / files.length : 0,
      lastModified,
      folderCounts
    };
  },

  uploadXmlFile: async (bucket: string, key: string, content: string): Promise<{ success: boolean, message: string }> => {
    await delay(1200);
    
    // Validate the XML content (simple check)
    if (!content.includes('<') || !content.includes('>')) {
      return {
        success: false,
        message: 'Invalid XML content'
      };
    }
    
    return {
      success: true,
      message: `File ${key} uploaded successfully to ${bucket}`
    };
  },

  deleteXmlFile: async (bucket: string, key: string): Promise<{ success: boolean, message: string }> => {
    await delay(800);
    
    return {
      success: true,
      message: `File ${key} deleted successfully from ${bucket}`
    };
  },

  // User preferences for dashboard (simulated persistence)
  saveUserPreferences: async (preferences: {
    defaultBucket?: string;
    defaultPrefix?: string;
    viewMode?: 'tree' | 'raw';
    pageSize?: number;
  }): Promise<void> => {
    await delay(200);
    
    // In a real implementation, this would save to localStorage or server
    localStorage.setItem('xmlExplorer.userPreferences', JSON.stringify(preferences));
  },

  getUserPreferences: async (): Promise<{
    defaultBucket?: string;
    defaultPrefix?: string;
    viewMode?: 'tree' | 'raw';
    pageSize?: number;
  }> => {
    await delay(200);
    
    // Load from localStorage if available
    const saved = localStorage.getItem('xmlExplorer.userPreferences');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse user preferences', e);
      }
    }
    
    // Default preferences
    return {
      defaultBucket: 'company-data',
      defaultPrefix: '',
      viewMode: 'tree',
      pageSize: 15
    };
  },

  // Search history tracking
  saveSearchHistory: async (search: { term: string; bucket: string; timestamp: number }): Promise<void> => {
    await delay(200);
    
    // Load existing history
    const historyStr = localStorage.getItem('xmlExplorer.searchHistory') || '[]';
    let history: Array<{ term: string; bucket: string; timestamp: number }> = [];
    
    try {
      history = JSON.parse(historyStr);
    } catch (e) {
      console.error('Failed to parse search history', e);
    }
    
    // Add new search and limit to 20 entries
    history.unshift(search);
    history = history.slice(0, 20);
    
    // Save back to localStorage
    localStorage.setItem('xmlExplorer.searchHistory', JSON.stringify(history));
  },

  getSearchHistory: async (): Promise<Array<{ term: string; bucket: string; timestamp: number }>> => {
    await delay(300);
    
    // Load from localStorage
    const historyStr = localStorage.getItem('xmlExplorer.searchHistory') || '[]';
    try {
      return JSON.parse(historyStr);
    } catch (e) {
      console.error('Failed to parse search history', e);
      return [];
    }
  },

  // Stats and analytics
  getSearchAnalytics: async (): Promise<{
    popularTerms: Array<{ term: string; count: number }>;
    popularBuckets: Array<{ bucket: string; count: number }>;
    searchesByDay: Array<{ date: string; count: number }>;
  }> => {
    await delay(1000);
    
    // In a real implementation, this would calculate from actual search history
    // Here we just return mock data
    return {
      popularTerms: [
        { term: 'sales', count: 12 },
        { term: 'report', count: 10 },
        { term: 'customer', count: 8 },
        { term: 'inventory', count: 6 },
        { term: 'product', count: 5 }
      ],
      popularBuckets: [
        { bucket: 'company-data', count: 25 },
        { bucket: 'reports-archive', count: 15 },
        { bucket: 'customer-archive', count: 12 },
        { bucket: 'configs-backup', count: 5 }
      ],
      searchesByDay: [
        { date: '2025-04-27', count: 15 },
        { date: '2025-04-28', count: 8 },
        { date: '2025-04-29', count: 12 },
        { date: '2025-04-30', count: 10 },
        { date: '2025-05-01', count: 7 }
      ]
    };
  }
};

export default mockApiService;