import { getOrderDetailsById } from "../../KIBO/OrderDetails";
import { TokenService } from "../TokenService";

/**
 * Sends order details to Capillary API as a transaction
 * @param orderId The Kibo order ID to send to Capillary
 * @returns Response from Capillary API or error
 */
export async function sendOrderDetails(orderId: string) {
    try {
        // Get order details from Kibo
        const orderDetails = await getOrderDetailsById(orderId);

        if(!orderDetails){
            return {
                success: false,
                message: "Order not found"
            }
        }

        // Get authentication token
        const tokenService = TokenService.getInstance();
        const token = await tokenService.getToken();
        
        // Extract customer email from order details
        const customerEmail = orderDetails.customerEmail || orderDetails.email;
        
        if (!customerEmail) {
            return {
                success: false,
                message: "Customer email not found in order details"
            }
        }
        
        // Prepare transaction data for Capillary
        const transactionData = {
            transactionDetails: {
                billNumber: orderId,
                billDate: new Date().toISOString(),
                transactionType: "PURCHASE",
                amount: {
                    value: orderDetails.total,
                    currency: orderDetails.currencyCode || "USD"
                },
                notes: `Order from Kibo Commerce - ${orderId}`
            },
            lineItems: orderDetails.items?.map((item: any) => ({
                id: item.id || item.productCode,
                description: item.name || item.productName,
                amount: {
                    value: item.price || item.unitPrice,
                    currency: orderDetails.currencyCode || "USD"
                },
                quantity: item.quantity,
                extendedFields: {
                    sku: item.sku || item.productCode
                }
            })) || []
        };
        
        // Make POST request to Capillary API
        const response = await fetch(
            `${process.env.CAPILLARY_URL}/v2/transactions?source=INSTORE&identifierName=email&identifierValue=${encodeURIComponent(customerEmail)}`,
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CAP-API-OAUTH-TOKEN': token,
                    'Accept-Language': 'en'
                },
                body: JSON.stringify(transactionData)
            }
        );
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error sending transaction to Capillary:', errorData);
            return {
                success: false,
                message: "Failed to send transaction to Capillary",
                error: errorData
            };
        }
        
        const responseData = await response.json();
        return {
            success: true,
            message: "Transaction sent to Capillary successfully",
            data: responseData
        };
        
    } catch (error) {
        console.error('Error in sendOrderDetails:', error);
        return {
            success: false,
            message: `Error sending order details: ${error instanceof Error ? error.message : String(error)}`
        };
    }
}