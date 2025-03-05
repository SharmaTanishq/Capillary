import dotenv from 'dotenv';
import { TokenService } from '../Capillary/TokenService';
import { getActiveCoupons } from '../Capillary/Rewards/GetCoupons';
import { CapillaryAuth } from '../Capillary/Auth';

// Load environment variables
dotenv.config();

/**
 * Test script to check if shokri@wooomail.com has any coupons
 */
async function testEmail() {
  try {
    console.log('Environment variables:');
    console.log(`CAPILLARY_URL: ${process.env.CAPILLARY_URL ? '✓ Set' : '✗ Not set'}`);
    console.log(`CAPILLARY_CLIENT_ID: ${process.env.CAPILLARY_CLIENT_ID ? '✓ Set' : '✗ Not set'}`);
    console.log(`CAPILLARY_CLIENT_SECRET: ${process.env.CAPILLARY_CLIENT_SECRET ? '✓ Set' : '✗ Not set'}`);
    
    console.log('\nGetting token directly from CapillaryAuth...');
    try {
      const auth = new CapillaryAuth();
      const token = await auth.authorize();
      console.log('Token obtained successfully:', token.substring(0, 10) + '...');
      
      console.log('\nTesting email: shokri@wooomail.com');
      const result = await getActiveCoupons('shokri@wooomail.com', token);
      
      console.log('API Response:');
      console.log(JSON.stringify(result, null, 2));
      
      if (Array.isArray(result) && result.length === 0) {
        console.log('No coupons found for shokri@wooomail.com');
      } else if (Array.isArray(result)) {
        console.log(`Found ${result.length} coupons for shokri@wooomail.com`);
      } else {
        console.log('Unexpected response format:', result);
      }
    } catch (authError) {
      console.error('Authentication error:', authError);
      console.log('\nPlease check your Capillary credentials in the .env file.');
      console.log('Make sure the CAPILLARY_URL, CAPILLARY_CLIENT_ID, and CAPILLARY_CLIENT_SECRET are correct.');
    }
  } catch (error) {
    console.error('Error testing email:', error);
  }
}

// Run the test
testEmail(); 