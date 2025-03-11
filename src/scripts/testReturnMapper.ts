import { config } from "dotenv";
import { KiboCapillaryReturnMapper } from "../Capillary/Transactions/KiboCapillaryReturnMapper";
import { getFullyRefundedReturns } from "../KIBO/ReturnDetails";

config();

async function testReturnMapper() {
    try {
        console.log('Testing KiboCapillaryReturnMapper...');
        
        // Get the first fully refunded return
        const returns = await getFullyRefundedReturns();
        if (!returns || !returns.items || returns.items.length === 0) {
            console.log('No fully refunded returns found in the last hour');
            return;
        }

        const firstReturn = returns.items[0];
        if (!firstReturn.id) {
            console.log('Return ID not found in the first return');
            return;
        }

        const returnOrderId = firstReturn.id;
        console.log(`\nFound return order: ${returnOrderId}`);
        
        console.log(`\nMapping Kibo return order ${returnOrderId} to Capillary format...`);
        const result = await KiboCapillaryReturnMapper.mapReturnToCapillaryFormat(returnOrderId);
        
        if (result.success && result.data) {
            console.log('\nSuccessfully mapped return order to Capillary format!');
            console.log('\nMapped Data:');
            console.log('- Identifier:', result.data.identifierType, '=', result.data.identifierValue);
            console.log('- Bill Number:', result.data.billNumber);
            console.log('- Bill Amount:', result.data.billAmount, '(negative for returns)');
            console.log('- Transaction Type:', result.data.type);
            
            console.log('\nReturn Line Items:');
            result.data.lineItemsV2.forEach((item, index) => {
                console.log(`\nItem ${index + 1}:`);
                console.log('- Description:', item.description);
                console.log('- Item Code:', item.itemCode);
                console.log('- Quantity:', item.qty);
                console.log('- Rate:', item.rate, '(negative for returns)');
                console.log('- Amount:', item.amount, '(negative for returns)');
                console.log('- SKU:', item.extendedFields.sku);
                console.log('- Return Reason:', item.extendedFields.returnReason);
            });
            
            console.log('\nPayment Modes:');
            result.data.paymentModes.forEach((payment, index) => {
                console.log(`\nPayment ${index + 1}:`);
                console.log('- Mode:', payment.mode);
                console.log('- Value:', payment.value, '(negative for returns)');
                console.log('- Notes:', payment.notes);
                console.log('- Return Reason:', payment.attributes.returnReason);
            });
            
            console.log('\nExtended Fields:');
            console.log('- Order Source:', result.data.extendedFields.orderSource);
            console.log('- Order Date:', result.data.extendedFields.orderDate);
            console.log('- Return Reason:', result.data.extendedFields.returnReason);
            console.log('- Original Order ID:', result.data.extendedFields.originalOrderId);
        } else {
            console.log('\n❌ Failed to map return order:', result.message);
        }
    } catch (error) {
        console.error('Error in test script:', error);
    }
}

testReturnMapper().catch(console.error); 