import { CommerceRuntimeOrderItem, Order, OrderItemCollection } from "@kibocommerce/rest-sdk/clients/Commerce";
import { TokenService } from "../TokenService";
import { KiboToCapillaryOrderMapper } from "./KiboCapillaryOrderMapper";
import { CapillaryTransaction, CapillaryTransactionResponse, CapillaryTransactionParams } from "./types";

/**
 * Sends order details to Capillary API as a transaction
 * @param orderId The Kibo order ID to send to Capillary
 * @returns Response from Capillary API or error
 */
export async function sendOrderDetails({orderDetails,orderItems}:{orderDetails:Order,orderItems:CommerceRuntimeOrderItem[]}): Promise<CapillaryTransactionResponse> {
    try {
        // Map Kibo order to Capillary format
        const mappingResult = await KiboToCapillaryOrderMapper.mapOrderToCapillaryFormat(orderDetails,orderItems);

        if (!mappingResult.success || !mappingResult.data) {
            return {
                success: false,
                message: mappingResult.message || "Failed to map order data"
            };
        }

        const transactionData = mappingResult.data;

        // Get authentication token
        const tokenService = TokenService.getInstance();
        const token = await tokenService.getToken();

        // Prepare query parameters
        const params: CapillaryTransactionParams = {
            source: "INSTORE",
            identifierName: "email",
            identifierValue: transactionData.identifierValue
        };

        // Build query string
        const queryString = Object.entries(params)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');

        console.log(
           `Transaction Data for ${orderDetails.externalId}`,transactionData);

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
        console.log(JSON.stringify(responseData, null, 2));
        return {
            success: true,
            message: "Transaction sent to Capillary successfully",
            data: responseData.errors[0]
        };

    } catch (error) {
        console.error('Error in sendOrderDetails:', error);
        return {
            success: false,
            message: `Error sending order details: ${error instanceof Error ? error.message : String(error)}`
        };
    }
}