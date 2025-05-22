import dotenv from 'dotenv';
import { SAMPLE_RETURN } from '../__tests__/Capillary/sampleReturn';
import { KiboCapillaryReturnMapper } from '../Capillary/Transactions/KiboCapillaryReturnMapper';
import { sendReturnDetails } from '../Capillary/Transactions/SendReturnDetails';
import { getReturnDetailsById } from '../KIBO/ReturnDetails';

// Load environment variables
dotenv.config();

// Add debug logging for environment variables


/**
 * Test script to verify the KiboCapillaryReturnMapper functionality
 */
async function testReturnMapper() {
    try {
        console.log('\nStarting return mapper test...');
        
        // Use the sample return ID
        const returnId = "192dbdb13cb7f7000118dd6f000f42b6";
        console.log(`Using return ID: ${returnId}`);

        // Map the return to Capillary format
        console.log('Mapping return to Capillary format...');
        const returnDetails = await getReturnDetailsById(returnId);
        
        if (!returnDetails) {
            console.error('Failed to fetch return details');
            return;
        }
        const mappedReturn = await KiboCapillaryReturnMapper.mapReturnToCapillaryFormat(returnDetails);
        

        if (!mappedReturn.success) {
            console.error('Failed to map return:', mappedReturn.message);
            return;
        }

        console.log('\nMapped return data:');
        console.log(JSON.stringify(mappedReturn.data, null, 2));

        // Send the mapped return to Capillary
        console.log('\nSending return to Capillary...');
        const result = await sendReturnDetails(mappedReturn.data);

        if (result.success) {
            console.log('\nSuccessfully sent return to Capillary!');
            console.log('Response:', JSON.stringify(result.data, null, 2));
        } else {
            console.error('\nFailed to send return to Capillary:', result.message);
            if (result.error) {
                console.error('Error details:', JSON.stringify(result.error, null, 2));
            }
        }
    } catch (error) {
        console.error('Error in test script:', error);
        if (error instanceof Error) {
            console.error('Error stack:', error.stack);
        }
    }
}

// Run the test
testReturnMapper(); 