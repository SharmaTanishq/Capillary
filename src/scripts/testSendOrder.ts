import dotenv from 'dotenv';
import { sendOrderDetails } from '../Capillary/Transactions/SendOrderDetails';

// Load environment variables
dotenv.config();

/**
 * Test script to verify the sendOrderDetails functionality
 */
async function testSendOrder() {
  try {
    console.log('Testing sendOrderDetails function...');
    
    // Replace with a valid order ID from your Kibo system
    const testOrderId = 'TEST-ORDER-123';
    
    console.log(`Sending order ${testOrderId} to Capillary...`);
    const result = await sendOrderDetails(testOrderId);
    
    console.log('Result:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Test completed successfully!');
    } else {
      console.log('❌ Test failed:', result.message);
    }
  } catch (error) {
    console.error('Error in test script:', error);
  }
}

// Run the test
testSendOrder(); 