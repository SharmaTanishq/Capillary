import { Return, ReturnItem } from "@kibocommerce/rest-sdk/clients/Commerce";
import { getReturnDetailsById } from "../../KIBO/ReturnDetails";
import { CapillaryReturnPayload, CapillaryReturnLineItem, CapillaryReturnPaymentMode } from "./types/return";
import doesCustomerExist from "../Customer";
import { getOrderDetailsById, orderClient } from "../../KIBO/OrderDetails";
import { getTenderTypeCode } from "./utils";

/**
 * Maps a Kibo return to Capillary transaction format
 */
export class KiboCapillaryReturnMapper {
    /**
     * Maps a Kibo return ID to Capillary transaction format
     * @param returnDetails The Kibo return details to map
     * @returns The mapped Capillary return payload or error
     */

    private static billNumber: string;
    private static billingDate: string;

    public static async mapReturnToCapillaryFormat(returnDetails: Return): Promise<{
        success: boolean;
        data?: CapillaryReturnPayload;
        message?: string;
    }> {
        try {
            if (!returnDetails) {
                return {
                    success: false,
                    message: "Return not found"
                };
            }

            // Extract identifierValue (externalId or fallback)
            const identifierValue = returnDetails.contact?.email || "";
            if (!identifierValue) {
                return {
                    success: false,
                    message: "Identifier value not found in return details"
                };
            }

            const customerExists = await doesCustomerExist(identifierValue);

            // Map return line items
            

            // Map return payment modes
            const paymentModes: CapillaryReturnPaymentMode[] = this.mapReturnPaymentModes(returnDetails);

            

            // Fetch original order details for billNumber and billingDate
            
            let billingDate = new Date().toISOString();
            
            if (returnDetails.originalOrderId) {
                const originalOrder = await orderClient.getOrder({ orderId: returnDetails.originalOrderId }).catch(() => undefined);
                this.billNumber = originalOrder?.externalId || "";
                this.billingDate = new Date(originalOrder?.submittedDate || billingDate).toISOString().split('.')[0]+"Z";
            }
            
            const lineItems: CapillaryReturnLineItem[] = this.mapReturnLineItems(returnDetails,this.billNumber);
            console.log(returnDetails.refundAmount)
            // Create Capillary return payload
            const returnPayload: CapillaryReturnPayload = {
                identifierType: "email",
                identifierValue,
                source: "INSTORE",                
                type: customerExists ? "RETURN" : "NI_RETURN",
                returnType: "LINE_ITEM",
                billNumber: returnDetails?.returnNumber?.toString() || "",
                discount: 0,
                billAmount: Number(returnDetails.productLossTotal ?? "0.0000"),
                grossAmount: Number(returnDetails.productLossTotal ?? "0.0000"),
                billingDate: this.billingDate,
                
                
                paymentModes,
                lineItemsV2: lineItems,
                
                
            };

            return {
                success: true,
                data: returnPayload
            };
        } catch (error) {
            return {
                success: false,
                message: `Error mapping return order: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }

    /**
     * Maps Kibo return items to Capillary line items
     */
    private static mapReturnLineItems(returnDetails: Return,billNumber:string): CapillaryReturnLineItem[] {
        const items = returnDetails.items?.map((item: ReturnItem, index: number) => ({
            itemCode: item.product?.variationProductCode || "",
            amount: Number(item.productLossAmount) || 0,
            rate: Number(item.product?.price?.price) || 0,
            qty: Number(item.quantityReceived) || 1,
            value: Number(item.productLossAmount) || 0,
            discount: 0,
            parentBillNumber: billNumber,
            returnType: "LINE_ITEM",
            type: "RETURN",                                    
            extendedFields: {                
                vat_amount: item.productLossTaxAmount ?? 0,
                service_tax_amount: 0,
                amount_including_tax: (item.product?.price?.price ?? 0) + (item.productLossTaxAmount ?? 0),
                amount_excluding_tax: item.product?.price?.price ?? 0
            },
            
            
        })) || [];

        return [...items,
            {                
                itemCode: "Taxsku",
                amount: (returnDetails.productLossTaxTotal ?? 0) + (returnDetails.shippingLossTaxTotal ?? 0),
                rate: (returnDetails.productLossTaxTotal ?? 0) + (returnDetails.shippingLossTaxTotal ?? 0),
                qty: 1.0,                
                
                value: (returnDetails.productLossTaxTotal ?? 0) + (returnDetails.shippingLossTaxTotal ?? 0),
                discount: 0.0,
        }];
    }

    /**
     * Maps Kibo return payment information to Capillary payment modes
     */
    private static mapReturnPaymentModes(returnDetails: Return): CapillaryReturnPaymentMode[] {
        return (returnDetails.payments || []).map(payment => ({
            
            
            mode: getTenderTypeCode(payment.paymentType || "", payment.billingInfo?.card?.paymentOrCardType || ""),
            value: -Number(payment.amountRequested)
        }));
    }
}