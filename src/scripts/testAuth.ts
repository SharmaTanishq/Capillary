import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

/**
 * Test script to check authentication with Capillary API
 */
async function testAuth() {
  try {
    console.log('Environment variables:');
    console.log(`CAPILLARY_URL: ${process.env.CAPILLARY_URL}`);
    console.log(`CAPILLARY_CLIENT_ID: ${process.env.CAPILLARY_CLIENT_ID?.substring(0, 5)}...`);
    console.log(`CAPILLARY_CLIENT_SECRET: ${process.env.CAPILLARY_CLIENT_SECRET?.substring(0, 5)}...`);
    
    const url = `${process.env.CAPILLARY_URL}/v3/oauth/token/generate`;
    console.log(`\nTrying to authenticate with URL: ${url}`);
    
    const response = await axios.post(
      url,
      {
        key: process.env.CAPILLARY_CLIENT_ID,
        secret: process.env.CAPILLARY_CLIENT_SECRET
      },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('\nAuthentication successful!');
    console.log('Response status:', response.status);
    console.log('Token:', response.data.data.accessToken.substring(0, 15) + '...');
    console.log('Expires in:', response.data.data.expiresIn, 'seconds');
    console.log('Token type:', response.data.data.tokenType);
  } catch (error) {
    console.error('\nAuthentication failed:');
    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status);
      console.error('Error message:', error.response?.data || error.message);
      
      // Provide troubleshooting tips
      if (error.response?.status === 401) {
        console.log('\nTroubleshooting tips:');
        console.log('1. Check if your CLIENT_ID and CLIENT_SECRET are correct');
        console.log('2. Check if your account has the necessary permissions');
        console.log('3. Check if the API endpoint URL is correct');
        console.log('4. The API might have changed its authentication method');
      }
    } else {
      console.error('Error:', error);
    }
  }
}

// Run the test
testAuth(); 