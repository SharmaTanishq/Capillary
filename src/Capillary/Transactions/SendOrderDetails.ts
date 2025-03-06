import { Order } from "@kibocommerce/rest-sdk/clients/Commerce";
import { getOrderDetailsById } from "../../KIBO/OrderDetails";
import { TokenService } from "../TokenService";
import { 
    CapillaryTransaction, 
    CapillaryLineItem, 
    CapillaryPaymentMode,
    CapillaryTransactionResponse,
    CapillaryTransactionParams
} from "./types";

/**
 * Sends order details to Capillary API as a transaction
 * @param orderId The Kibo order ID to send to Capillary
 * @returns Response from Capillary API or error
 */
export async function sendOrderDetails(orderId: string): Promise<CapillaryTransactionResponse> {
    try {
        // Get order details from Kibo
        const orderDetails:Order = await getOrderDetailsById(orderId);

        if(!orderDetails){
            return {
                success: false,
                message: "Order not found"
            };
        }

        // Get authentication token
        const tokenService = TokenService.getInstance();
        const token = await tokenService.getToken();
        
        // Extract customer email from order details
        const customerEmail = orderDetails.email ;
        
        if (!customerEmail) {
            return {
                success: false,
                message: "Customer email not found in order details"
            };
        }
        
        // Prepare line items
        const lineItems: CapillaryLineItem[] = orderDetails.items?.map((item: any) => ({
            description: item.name || item.productName || "",
            discount: null,
            itemCode: item.id || item.productCode || item.sku,
            amount: Number(item.price) || Number(item.unitPrice) || 0,
            qty: item.quantity || "1",
            rate: (Number(item.price) || Number(item.unitPrice) || 0) / (Number(item.quantity) || 1),
            serial: 1,
            value: String(Number(item.price) || Number(item.unitPrice) || 0),
            extendedFields: {
                sku: item.sku || item.productCode || ""
            }
        })) || [];
        
        // Prepare payment modes
        const paymentModes: CapillaryPaymentMode[] = [
            {
                mode: orderDetails.payments?.[0]?.paymentType || "Credit",
                value: Number(orderDetails.total) || 0,
                notes: `Payment for order ${orderId}`,
                attributes: {}
            }
        ];
        
        // Prepare transaction data for Capillary
        const transactionData: CapillaryTransaction = {
            identifierType: "email",
            identifierValue: customerEmail,
            source: "Instore",
            addWithLocalCurrency: false,
            type: "REGULAR",
            billAmount: String(orderDetails.total) || "0",
            billNumber: orderId,
            lineItemsV2: lineItems,
            paymentModes: paymentModes,
            extendedFields: {
                orderSource: "Kibo Commerce",
                orderDate: orderDetails.submittedDate || new Date().toISOString()
            }
        };
        
        // Prepare query parameters
        const params: CapillaryTransactionParams = {
            source: "INSTORE",
            identifierName: "email",
            identifierValue: customerEmail
        };
        
        // Build query string
        const queryString = Object.entries(params)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');
        
        // Make POST request to Capillary API
        const response = await fetch(
            `${process.env.CAPILLARY_URL}/v2/transactions?${queryString}`,
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