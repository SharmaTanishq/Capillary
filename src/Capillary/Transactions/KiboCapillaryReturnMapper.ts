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
            const lineItems: CapillaryReturnLineItem[] = this.mapReturnLineItems(returnDetails);

            // Map return payment modes
            const paymentModes: CapillaryReturnPaymentMode[] = this.mapReturnPaymentModes(returnDetails);

            // Placeholder/defaults for new fields
            const customFields = { CountryCode: "ID", membership_card: null };
            const extendedFields = { order_channel: "DigitalLoyaltyCard", "membership_card_swiped ": "BMW" };
            const appliedPromotionIdentifiers: string[] = [];

            // Fetch original order details for billNumber and billingDate
            let billNumber = "";
            let billingDate = new Date().toISOString();
            
            if (returnDetails.originalOrderId) {
                const originalOrder = await orderClient.getOrder({ orderId: returnDetails.originalOrderId }).catch(() => undefined);
                billNumber = originalOrder?.externalId || "";
                billingDate = originalOrder?.submittedDate || billingDate;
            }

            // Create Capillary return payload
            const returnPayload: CapillaryReturnPayload = {
                identifierType: "email",
                identifierValue,
                source: "INSTORE",
                accountId: null,
                type: customerExists ? "RETURN" : "NI_RETURN",
                returnType: "LINE_ITEM",
                billNumber,
                discount: 0,
                billAmount: String(returnDetails.refundAmount ?? "0.0000"),
                note: "",
                grossAmount: null,
                deliveryStatus: null,
                purchaseTime: null,
                billingDate,
                currencyCode: "USD",
                appliedPromotionIdentifiers,
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
    private static mapReturnLineItems(returnDetails: Return): CapillaryReturnLineItem[] {
        return returnDetails.items?.map((item: ReturnItem, index: number) => ({
            type: "RETURN",
            returnType: "LINE_ITEM",
            // parentOrderItemId does not exist on ReturnItem; using empty string as placeholder
            parentBillNumber: "", // TODO: Map to correct field if available
            itemCode: item.product?.productCode || "",
            amount: Number(item.refundAmount) || 0,
            rate: Number(item.product?.price?.price) || 0,
            discount: 0,
            value: Number(item.refundAmount) || 0,
            qty: Number(item.quantityReceived) || 1,
            description: item.product?.name || "",
            serial: String(index + 1),
            extendedFields: {
                
                vat_amount: 0,
                service_tax_amount: 0,
                amount_including_tax: 0,
                amount_excluding_tax: 0
            },
            customFields: null,
            appliedPromotionIdentifiers: []
        })) || [];
    }

    /**
     * Maps Kibo return payment information to Capillary payment modes
     */
    private static mapReturnPaymentModes(returnDetails: Return): CapillaryReturnPaymentMode[] {
        return (returnDetails.payments || []).map(payment => ({
            attributes: null,
            notes: null,
            mode: getTenderTypeCode(payment.paymentType ?? ""),
            value: String(payment.amountRequested ?? returnDetails.refundAmount ?? "0.0000")
        }));
    }
}