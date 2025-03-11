import { CommerceRuntimeOrderItem, Order, OrderItemCollection } from "@kibocommerce/rest-sdk/clients/Commerce";
import { CapillaryTransaction, CapillaryLineItem, CapillaryPaymentMode } from "./types";
import doesCustomerExist from "../Customer";
/**
 * Maps a Kibo order to Capillary transaction format
 * 
 */


export class KiboToCapillaryOrderMapper {
    /**
     * Maps a Kibo order ID to Capillary transaction format
     * @param orderId The Kibo order ID to map
     * @returns The mapped Capillary transaction data or error
     */
    public static async mapOrderToCapillaryFormat(orderDetails:Order,orderItems:CommerceRuntimeOrderItem[]): Promise<{
        success: boolean;
        data?: CapillaryTransaction;
        message?: string;
    }> {
        try {
            // Get order details from Kibo
            

            //ITEMS will be from orderResponse.synthesized.items
            //Rest Details will be from orderResponse.unSynthesized

            if (!orderDetails) {
                return {
                    success: false,
                    message: "Order not found"
                };
            }

            //const orderDetails: Order = orderResponse.synthesized;

            // Extract customer email from order details
            const customerEmail = orderDetails.email;

            if (!customerEmail) {
                return {
                    success: false,
                    message: "Customer email not found in order details"
                };
            }

            const customerExists = await doesCustomerExist(customerEmail);

            // Map line items
            const lineItems: CapillaryLineItem[] = this.mapLineItems(orderItems);

            // Map payment modes
            const paymentModes: CapillaryPaymentMode[] = this.mapPaymentModes(orderDetails);

            // Create transaction data
            const transactionData: CapillaryTransaction = {
                identifierType: "email",
                identifierValue: customerEmail,
                source: "Instore",
                addWithLocalCurrency: false,
                type: customerExists ? "REGULAR" : "NOT_INTERESTED",
                billAmount: String(orderDetails.total) || "0",
                billNumber: orderDetails.id!,
                lineItemsV2: lineItems,
                paymentModes: paymentModes,
                extendedFields: {
                    orderSource: "Kibo Commerce",
                    orderDate: orderDetails.submittedDate || new Date().toISOString()
                }
            };

            return {
                success: true,
                data: transactionData
            };
        } catch (error) {
            return {
                success: false,
                message: `Error mapping order: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }

    /**
     * Maps Kibo order items to Capillary line items
     */
    private static mapLineItems(orderItems: CommerceRuntimeOrderItem[]): CapillaryLineItem[] {
        return orderItems?.map(item => ({
            description: item.product?.name || "",
            discount: null,
            itemCode: item.product?.productCode || "",
            amount: Number(item.total) || 0,
            qty: String(item.quantity) || "1",
            rate: Number(item.unitPrice?.saleAmount) || 0,
            serial: 1,
            value: String(item.total) || "0",
            extendedFields: {
                sku: item.product?.variationProductCode || ""
            }
        })) || [];
    }

    /**
     * Maps Kibo payment information to Capillary payment modes
     */
    private static mapPaymentModes(orderDetails: Order): CapillaryPaymentMode[] {
        return [{
            mode: orderDetails.billingInfo?.paymentType || "Credit",
            value: Number(orderDetails.total) || 0,
            notes: `Payment for order ${orderDetails.id}`,
            attributes: {}
        }];
    }
} 