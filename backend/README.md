## S3-based XML file search application

## Backend (Node.js/Express)

- **S3Service**: Core functionality for interacting with S3 buckets and XML files
- **XML Controller**: API endpoints for file operations (list, view, search, download)
- **Routes**: URL structure for the API
- **Server/App Configuration**: Express setup with error handling

## Key Features

1. **Bucket Selection**: Connect to any S3 bucket with saved history
2. **XML Content Viewing**: Tree view for easy navigation or raw view for detailed inspection
3. **Advanced Search**: Search within XML content with match highlighting
4. **Responsive Design**: Works on desktop and mobile devices
5. **No Database Required**: Works directly with S3 without needing a database

To deploy this application:

1. Set up the backend with proper AWS credentials
2. Configure the frontend to point to your backend API
3. For remote access, set up a VPN as recommended
