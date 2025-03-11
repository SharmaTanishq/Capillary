import { config } from "dotenv";
import { getOrderDetailsById } from "../KIBO/OrderDetails";
import { Order } from "@kibocommerce/rest-sdk/clients/Commerce";

// Load environment variables
config();

/**
 * Test script to examine a Kibo order
 */
async function testKiboOrder() {
    console.log("Fetching order details...");
    const orderId = "18a0e8d978d8ee0001cbefca000186c1";
    
    try {
        const orderDetails = await getOrderDetailsById(orderId);
        
        if (!orderDetails) {
            console.error("Order not found");
            return;
        }

        const order: Order = orderDetails.synthesized;

        // Extract key fields from the response
        console.log("\nKey fields:");
        console.log(`Email: ${order.email}`);
        console.log(`Total: $${order.total}`);
        console.log(`Items Count: ${order.items?.length || 0}`);
        console.log(`Submitted Date: ${order.submittedDate}`);
        console.log(`Payment Type: ${order.billingInfo?.paymentType}`);
        console.log(`Order Status: ${order.status}`);
        
        // Print item details
        console.log("\nOrder Items:");
        order.items?.forEach((item, index) => {
            console.log(`\nItem ${index + 1}:`);
            console.log(`- Product: ${item.product?.name || 'Unknown Product'}`);
            console.log(`- Quantity: ${item.quantity}`);
            console.log(`- Unit Price: $${item.unitPrice?.saleAmount || 0}`);
            console.log(`- Total: $${item.total}`);
        });

    } catch (error) {
        console.error("Error fetching order details:", error);
    }
}

// Run the test
testKiboOrder().catch(console.error); 