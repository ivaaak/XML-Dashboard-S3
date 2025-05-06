import { Request, Response } from 'express';
import s3Service, { XmlSearchOptions } from '../services/s3Service';
import { parseStringPromise } from 'xml2js';

export class XmlController {
    /**
     * Get a list of XML files in an S3 bucket
     */
    async listXmlFiles(req: Request, res: Response): Promise<void> {
        try {
            const { bucket, prefix = '' } = req.query;

            if (!bucket) {
                res.status(400).json({
                    success: false,
                    message: 'Bucket name is required'
                });
                return;
            }

            const files = await s3Service.findXmlFiles(bucket as string, prefix as string);

            res.json({
                success: true,
                data: {
                    bucket,
                    fileCount: files.length,
                    files
                }
            });
        } catch (error) {
            console.error('Error listing XML files:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to list XML files',
                error: error.message
            });
        }
    }

    /**
     * Get the content of an XML file from S3
     */
    async getXmlFileContent(req: Request, res: Response): Promise<void> {
        try {
            const { bucket, key } = req.query;

            if (!bucket || !key) {
                res.status(400).json({
                    success: false,
                    message: 'Bucket name and file key are required'
                });
                return;
            }

            const xmlData = await s3Service.parseXmlFile(bucket as string, key as string);

            if (!xmlData) {
                res.status(404).json({
                    success: false,
                    message: 'XML file not found or could not be parsed'
                });
                return;
            }

            res.json({
                success: true,
                data: {
                    bucket,
                    key,
                    content: xmlData
                }
            });
        } catch (error) {
            console.error('Error fetching XML file content:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch XML file content',
                error: error.message
            });
        }
    }

    /**
     * Search through XML files in an S3 bucket
     */
    async searchXml(req: Request, res: Response): Promise<void> {
        try {
            const { bucket, term, prefix, matchCase, limit } = req.body;

            if (!bucket || !term) {
                res.status(400).json({
                    success: false,
                    message: 'Bucket name and search term are required'
                });
                return;
            }

            const options: XmlSearchOptions = {
                filePrefix: prefix || '',
                matchCase: !!matchCase,
                limit: limit ? parseInt(limit) : 100
            };

            const results = await s3Service.searchXmlInBucket(bucket, term, options);

            res.json({
                success: true,
                data: results
            });
        } catch (error) {
            console.error('Error searching XML:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to search XML files',
                error: error.message
            });
        }
    }

    /**
     * Generate a pre-signed URL for downloading a file
     */
    async getSignedUrl(req: Request, res: Response): Promise<void> {
        try {
            const { bucket, key, expiresIn } = req.query;

            if (!bucket || !key) {
                res.status(400).json({
                    success: false,
                    message: 'Bucket name and file key are required'
                });
                return;
            }

            const expiry = expiresIn ? parseInt(expiresIn as string) : 3600;
            const url = await s3Service.getSignedUrl(bucket as string, key as string, expiry);

            res.json({
                success: true,
                data: {
                    bucket,
                    key,
                    url,
                    expiresIn: expiry
                }
            });
        } catch (error) {
            console.error('Error generating signed URL:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate signed URL',
                error: error.message
            });
        }
    }

    /**
     * Upload XML content to S3
     */
    async uploadXml(req: Request, res: Response): Promise<void> {
        try {
            const { bucket, key, content } = req.body;

            if (!bucket || !key || !content) {
                res.status(400).json({
                    success: false,
                    message: 'Bucket name, file key, and content are required'
                });
                return;
            }

            // Validate that content is valid XML
            try {
                const parseTest = await parseStringPromise(content);
            } catch (error) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid XML content',
                    error: error.message
                });
                return;
            }

            const etag = await s3Service.uploadFile(bucket, key, content, 'application/xml');

            if (!etag) {
                res.status(500).json({
                    success: false,
                    message: 'Failed to upload file'
                });
                return;
            }

            res.json({
                success: true,
                data: {
                    bucket,
                    key,
                    etag
                }
            });
        } catch (error) {
            console.error('Error uploading XML:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to upload XML file',
                error: error.message
            });
        }
    }

    /**
     * Delete an XML file from S3
     */
    async deleteXml(req: Request, res: Response): Promise<void> {
        try {
            const { bucket, key } = req.body;

            if (!bucket || !key) {
                res.status(400).json({
                    success: false,
                    message: 'Bucket name and file key are required'
                });
                return;
            }

            const deleted = await s3Service.deleteFile(bucket, key);

            if (!deleted) {
                res.status(500).json({
                    success: false,
                    message: 'Failed to delete file'
                });
                return;
            }

            res.json({
                success: true,
                message: 'File deleted successfully',
                data: {
                    bucket,
                    key
                }
            });
        } catch (error) {
            console.error('Error deleting XML:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete XML file',
                error: error.message
            });
        }
    }
}

export default new XmlController();