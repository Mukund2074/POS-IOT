import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Set default values for required environment variables
process.env.REACT_APP_URL = process.env.REACT_APP_URL || 'https://api.fiind.app';
process.env.REACT_APP_MARKETPLACE_URL = process.env.REACT_APP_MARKETPLACE_URL || 'https://bahlou.dk/';
process.env.REACT_APP_IMG_URL = process.env.REACT_APP_IMG_URL || 'https://fiind-dev.s3.amazonaws.com/';
process.env.REACT_TEST_TOKEN =
    process.env.REACT_TEST_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..SxMJy4KdNyPzXpF5m5UmIBh9VPgCE1Ijxy5mW_h4GAg';
