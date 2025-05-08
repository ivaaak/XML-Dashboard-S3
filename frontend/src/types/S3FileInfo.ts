export interface S3FileInfo {
    key: string;
    bucket: string;
    size?: number;
    lastModified?: Date;
    contentType?: string;
    metadata?: Record<string, string>;
    etag?: string;
    url?: string;
}