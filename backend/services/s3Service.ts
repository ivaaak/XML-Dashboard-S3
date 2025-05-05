import {
    S3Client,
    ListObjectsV2Command,
    GetObjectCommand,
    HeadObjectCommand,
    DeleteObjectCommand,
    PutObjectCommand,
    _Object
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';
import { parseStringPromise } from 'xml2js';

export interface S3Config {
    region: string;
    credentials: {
        accessKeyId: string;
        secretAccessKey: string;
    };
    endpoint?: string; // For local development or custom S3-compatible storage
}


export interface XmlSearchResult {
    file: S3FileInfo;
    matches: Array<{
        path: string;
        value: string;
    }>;
    matchCount: number;
}

export interface XmlSearchOptions {
    recursive?: boolean;
    matchCase?: boolean;
    elementPath?: string;
    limit?: number;
    filePrefix?: string;
}

export class S3Service {
    private s3Client: S3Client;

    constructor(config: S3Config) {
        this.s3Client = new S3Client(config);
    }

    /**
     * List objects in a bucket with optional prefix
     */
    async listFiles(bucket: string, prefix: string = ''): Promise<S3FileInfo[]> {
        try {
            const command = new ListObjectsV2Command({
                Bucket: bucket,
                Prefix: prefix
            });

            const response = await this.s3Client.send(command);

            if (!response.Contents) {
                return [];
            }

            return response.Contents.map(item => ({
                key: item.Key || '',
                bucket,
                size: item.Size,
                lastModified: item.LastModified,
                etag: item.ETag
            }));
        } catch (error) {
            console.error('Error listing files from S3:', error);
            throw error;
        }
    }

    /**
     * Get file metadata from S3
     */
    async getFileInfo(bucket: string, key: string): Promise<S3FileInfo | null> {
        try {
            const command = new HeadObjectCommand({
                Bucket: bucket,
                Key: key
            });

            const response = await this.s3Client.send(command);

            return {
                key,
                bucket,
                size: response.ContentLength,
                lastModified: response.LastModified,
                contentType: response.ContentType,
                metadata: response.Metadata,
                etag: response.ETag
            };
        } catch (error) {
            console.error(`Error getting file info for ${key}:`, error);
            return null;
        }
    }

    /**
     * Get a file from S3 as a buffer
     */
    async getFileContent(bucket: string, key: string): Promise<Buffer | null> {
        try {
            const command = new GetObjectCommand({
                Bucket: bucket,
                Key: key
            });

            const response = await this.s3Client.send(command);

            if (!response.Body) {
                return null;
            }

            // Convert stream to buffer
            return this.streamToBuffer(response.Body as Readable);
        } catch (error) {
            console.error(`Error fetching file ${key}:`, error);
            return null;
        }
    }

    /**
     * Parse an XML file directly from S3
     */
    async parseXmlFile(bucket: string, key: string): Promise<any | null> {
        try {
            const xmlBuffer = await this.getFileContent(bucket, key);

            if (!xmlBuffer) {
                return null;
            }

            const xmlString = xmlBuffer.toString('utf-8');
            const result = await parseStringPromise(xmlString, {
                explicitArray: false,
                normalizeTags: true
            });

            return result;
        } catch (error) {
            console.error(`Error parsing XML file ${key}:`, error);
            return null;
        }
    }

    /**
     * Upload a file to S3
     */
    async uploadFile(bucket: string, key: string, content: Buffer | string, contentType?: string): Promise<string | null> {
        try {
            const command = new PutObjectCommand({
                Bucket: bucket,
                Key: key,
                Body: content,
                ContentType: contentType || 'application/xml'
            });

            const response = await this.s3Client.send(command);

            return response.ETag || null;
        } catch (error) {
            console.error(`Error uploading file ${key}:`, error);
            return null;
        }
    }

    /**
     * Delete a file from S3
     */
    async deleteFile(bucket: string, key: string): Promise<boolean> {
        try {
            const command = new DeleteObjectCommand({
                Bucket: bucket,
                Key: key
            });

            await this.s3Client.send(command);
            return true;
        } catch (error) {
            console.error(`Error deleting file ${key}:`, error);
            return false;
        }
    }

    /**
     * Find all XML files in a bucket
     */
    async findXmlFiles(bucket: string, prefix: string = ''): Promise<S3FileInfo[]> {
        try {
            const allFiles = await this.listFiles(bucket, prefix);

            // Filter for XML files based on key extension
            return allFiles.filter(file =>
                file.key.toLowerCase().endsWith('.xml')
            );
        } catch (error) {
            console.error('Error finding XML files:', error);
            throw error;
        }
    }

    /**
     * Search for a term within XML files in a bucket
     */
    async searchXmlInBucket(bucket: string, searchTerm: string, options: XmlSearchOptions = {}): Promise<{
        searchTerm: string,
        totalFiles: number,
        matchedFiles: number,
        totalMatches: number,
        matches: XmlSearchResult[]
    }> {
        try {
            const {
                matchCase = false,
                limit = 100,
                filePrefix = ''
            } = options;

            // Find all XML files
            const xmlFiles = await this.findXmlFiles(bucket, filePrefix);

            const results = {
                searchTerm,
                totalFiles: xmlFiles.length,
                matchedFiles: 0,
                totalMatches: 0,
                matches: [] as XmlSearchResult[]
            };

            // Process each XML file until we hit the limit
            for (const file of xmlFiles) {
                if (limit && results.matches.length >= limit) {
                    break;
                }

                try {
                    // Parse XML
                    const xmlData = await this.parseXmlFile(bucket, file.key);
                    if (!xmlData) continue;

                    // Search for matches
                    const searchResult = this.findMatchesInObject(xmlData, searchTerm, { matchCase });

                    if (searchResult.count > 0) {
                        results.matchedFiles++;
                        results.totalMatches += searchResult.count;
                        results.matches.push({
                            file,
                            matches: searchResult.matches,
                            matchCount: searchResult.count
                        });
                    }
                } catch (error) {
                    console.error(`Error processing file ${file.key}:`, error);
                }
            }

            return results;
        } catch (error) {
            console.error('Error searching XML in bucket:', error);
            throw error;
        }
    }

    /**
     * Generate a pre-signed URL for downloading a file
     */
    async getSignedUrl(bucket: string, key: string, expiresIn: number = 3600): Promise<string> {
        try {
            const command = new GetObjectCommand({
                Bucket: bucket,
                Key: key
            });

            return await getSignedUrl(this.s3Client, command, { expiresIn });
        } catch (error) {
            console.error(`Error generating signed URL for ${key}:`, error);
            throw error;
        }
    }

    /**
     * Helper to find matches in an object
     */
    private findMatchesInObject(obj: any, searchTerm: string, options: { matchCase?: boolean } = {}): {
        count: number;
        matches: Array<{ path: string; value: string }>
    } {
        const matches: Array<{ path: string; value: string }> = [];
        let count = 0;

        const term = options.matchCase ? searchTerm : searchTerm.toLowerCase();

        const search = (currentObj: any, path: string[] = []) => {
            if (!currentObj) return;

            if (typeof currentObj === 'string') {
                const value = options.matchCase ? currentObj : currentObj.toLowerCase();
                if (value.includes(term)) {
                    count++;
                    matches.push({
                        path: path.join('.'),
                        value: currentObj
                    });
                }
            } else if (Array.isArray(currentObj)) {
                currentObj.forEach((item, index) => {
                    search(item, [...path, index.toString()]);
                });
            } else if (typeof currentObj === 'object') {
                Object.entries(currentObj).forEach(([key, value]) => {
                    search(value, [...path, key]);
                });
            }
        };

        search(obj);
        return { count, matches };
    }

    /**
     * Helper to convert a stream to a buffer
     */
    private async streamToBuffer(stream: Readable): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const chunks: any[] = [];

            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('error', reject);
            stream.on('end', () => resolve(Buffer.concat(chunks)));
        });
    }
}

// Create and export a singleton instance
export default new S3Service({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
    },
    endpoint: process.env.S3_ENDPOINT // Optional: for non-AWS S3-compatible storage
});