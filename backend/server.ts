import dotenv from 'dotenv';
import app from './app';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  
  // Log S3 configuration
  console.log('S3 Configuration:');
  console.log(`- Region: ${process.env.AWS_REGION || 'us-east-1'}`);
  console.log(`- Endpoint: ${process.env.S3_ENDPOINT || 'AWS Default'}`);
  console.log(`- Credentials: ${process.env.AWS_ACCESS_KEY_ID ? 'Configured' : 'Not Configured'}`);
});