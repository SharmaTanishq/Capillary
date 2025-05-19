import { CommerceRuntimeOrderItem, Order, OrderItemCollection } from "@kibocommerce/rest-sdk/clients/Commerce";
import { CapillaryTransaction, CapillaryLineItem, CapillaryPaymentMode } from "./types";
import doesCustomerExist from "../Customer";
import { getTenderTypeCode } from "./utils";
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
                discount: orderDetails.discountTotal || 0,
                addWithLocalCurrency: false,
                type: customerExists ? "REGULAR" : "NOT_INTERESTED",
                billAmount: String(orderDetails.total) || "0",
                grossAmount: String(orderDetails.total) || "0",
                billNumber: orderDetails?.externalId || orderDetails.id!,
                lineItemsV2: lineItems,
                paymentModes: paymentModes,
               
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
            discount: item.productDiscount?.impact || 0,
            itemCode: item.product?.variationProductCode || "",
            amount: Number(item.extendedTotal) ,
            qty: String(item.quantity) ,
            rate: Number(item.product?.price?.price) || 0,
            serial: 1,
            value: Number(item.extendedTotal) || 0,
            extendedFields: {
                amount_excluding_tax: item.product?.price?.price!  || 0,
                amount_including_tax: item.product?.price?.price! + item.itemTaxTotal! || 0,
                vat_amount: item.itemTaxTotal! || 0,
                service_tax_amount:  0
            }
        })) || [];
    }

    /**
     * Maps Kibo payment information to Capillary payment modes
     */
    private static mapPaymentModes(orderDetails: Order): CapillaryPaymentMode[] {
        return orderDetails.payments?.map(payment => ({
            mode: getTenderTypeCode(payment.paymentType ?? ""),
            value: Number(payment.amountRequested ?? payment.amountCollected ?? "0.0000"),
            notes: `Payment for order ${orderDetails.id}`,
            attributes: {}
        })) || [];
    }
} 