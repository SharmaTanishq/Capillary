import dotenv from 'dotenv';
import doesCustomerExist from '../Capillary/Customer';

// Load environment variables
dotenv.config();

/**
 * Test script to verify customer lookup functionality
 */
async function testCustomerLookup() {
    try {
        console.log('Testing customer lookup...');
        
        // Test with the example email
        const email = 'shokri@wooomail.com';
        console.log(`\nChecking if customer exists: ${email}`);
        
        const exists = await doesCustomerExist(email);
        console.log(`Result: Customer ${exists ? 'exists' : 'does not exist'}`);
        
        // Test with a non-existent email
        const nonExistentEmail = 'nonexistent@example.com';
        console.log(`\nChecking if customer exists: ${nonExistentEmail}`);
        
        const nonExistentResult = await doesCustomerExist(nonExistentEmail);
        console.log(`Result: Customer ${nonExistentResult ? 'exists' : 'does not exist'}`);
        
    } catch (error) {
        console.error('Error in test script:', error);
    }
}

// Run the test
testCustomerLookup(); 