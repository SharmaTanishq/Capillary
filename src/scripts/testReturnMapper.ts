import dotenv from 'dotenv';
import { KiboCapillaryReturnMapper } from '../Capillary/Transactions/KiboCapillaryReturnMapper';
import { getFullyRefundedReturns } from '../KIBO/ReturnDetails';

// Load environment variables
dotenv.config();

/**
 * Test script to verify the KiboCapillaryReturnMapper functionality
 */
async function testReturnMapper() {
    try {
        console.log('Testing KiboCapillaryReturnMapper...');
        
        // Get first fully refunded return
        const returns = await getFullyRefundedReturns();
        
        if (!returns || !returns.items || returns.items.length === 0) {
            console.log('No fully refunded returns found');
            return;
        }
        
        const firstReturn = returns.items[0];
        
        if (!firstReturn.id) {
            console.log('Return ID not found in the first return');
            return;
        }
        
        console.log(`\nFound return order: ${firstReturn.id}`);
        
        console.log(`\nMapping Kibo return order ${firstReturn.id} to Capillary format...`);
        
        // Map the return to Capillary format
        const result = await KiboCapillaryReturnMapper.mapReturnToCapillaryFormat(firstReturn.id);
        
        if (result.success && result.data) {
            console.log('\nSuccessfully mapped return order to Capillary format!');
            
            // Output the complete object as JSON
            console.log('\nComplete Mapped Object:');
            console.log(JSON.stringify(result.data, null, 2));
        } else {
            console.log('\n❌ Mapping failed:', result.message);
        }
    } catch (error) {
        console.error('Error in test script:', error);
    }
}

// Run the test
testReturnMapper(); 