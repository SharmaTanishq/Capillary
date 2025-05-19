import dotenv from 'dotenv';
import { KiboToCapillaryOrderMapper } from '../Capillary/Transactions/KiboCapillaryOrderMapper';
import { sampleOrder } from '../__tests__/Capillary/sampleOrder';
import { getOrderDetailsById } from '../KIBO/OrderDetails';

// Load environment variables
dotenv.config();

/**
 * Test script to verify the KiboToCapillaryOrderMapper functionality
 */
async function testOrderMapper() {
  try {
    console.log('Testing KiboToCapillaryOrderMapper...');
    
    console.log(`Mapping Kibo order ${sampleOrder.id} to Capillary format...`);
    
    const order = await getOrderDetailsById("1927bbd331ab8e000186e6ca000f42b6");
    if(!order || !order?.synthesized || !order?.unSynthesized.items) {
      console.log("Order not found");
      return;
    }
    
    // Map the sample order to Capillary format
    const result = await KiboToCapillaryOrderMapper.mapOrderToCapillaryFormat(order?.unSynthesized, order?.synthesized?.items!);
    
    if (result.success && result.data) {
      console.log('\nSuccessfully mapped order to Capillary format!');
      
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
testOrderMapper(); 