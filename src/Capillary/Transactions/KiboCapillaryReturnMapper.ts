import { Return, ReturnItem } from "@kibocommerce/rest-sdk/clients/Commerce";
import { getReturnDetailsById } from "../../KIBO/ReturnDetails";
import { CapillaryTransaction, CapillaryLineItem, CapillaryPaymentMode } from "./types";
import doesCustomerExist from "../Customer";

/**
 * Maps a Kibo return to Capillary transaction format
 */
export class KiboCapillaryReturnMapper {
    /**
     * Maps a Kibo return ID to Capillary transaction format
     * @param returnId The Kibo return ID to map
     * @returns The mapped Capillary transaction data or error
     */
    public static async mapReturnToCapillaryFormat(returnId: string): Promise<{
        success: boolean;
        data?: CapillaryTransaction;
        message?: string;
    }> {
        try {
            // Get return details from Kibo
            const returnDetails = await getReturnDetailsById(returnId);

            if (!returnDetails) {
                return {
                    success: false,
                    message: "Return not found"
                };
            }

            // Extract customer email from return details
            const customerEmail = String(returnDetails.customerAccountId || '');

            if (!customerEmail) {
                return {
                    success: false,
                    message: "Customer email not found in return details"
                };
            }

            // Map return line items
            const lineItems: CapillaryLineItem[] = this.mapReturnLineItems(returnDetails);

            // Map return payment modes
            const paymentModes: CapillaryPaymentMode[] = this.mapReturnPaymentModes(returnDetails);

            // Create transaction data for return
            const transactionData: CapillaryTransaction = {
                identifierType: "email",
                identifierValue: customerEmail,
                source: "Instore",
                addWithLocalCurrency: false,
                type: "RETURN",
                billAmount: String(returnDetails.refundAmount) || "0",
                billNumber: returnId,
                lineItemsV2: lineItems,
                paymentModes: paymentModes,
                extendedFields: {
                    orderSource: "Kibo Commerce",
                    orderDate: returnDetails.auditInfo?.createDate || new Date().toISOString(),
                    returnReason: returnDetails.items?.[0]?.reasons?.[0]?.reason || "Not Specified",
                    originalOrderId: returnDetails.originalOrderId || ""
                }
            };

            return {
                success: true,
                data: transactionData
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
    private static mapReturnLineItems(returnDetails: Return): CapillaryLineItem[] {
        return returnDetails.items?.map((item: ReturnItem, index: number) => ({
            description: item.product?.name || "",
            discount: null,
            itemCode: item.product?.productCode || "",
            amount: Number(item.refundAmount) || 0,
            qty: String(item.quantityReceived) || "1",
            rate: Number(item.product?.price?.price) || 0,
            serial: index + 1,
            value: String(Number(item.refundAmount)) || "0",
            extendedFields: {
                sku: item.product?.variationProductCode || "",
                returnReason: item.reasons?.[0]?.reason || returnDetails.items?.[0]?.reasons?.[0]?.reason || "Not Specified"
            }
        })) || [];
    }

    /**
     * Maps Kibo return payment information to Capillary payment modes
     */
    private static mapReturnPaymentModes(returnDetails: Return): CapillaryPaymentMode[] {
        return [{
            mode: returnDetails.payments?.[0]?.paymentType || "Credit",
            value: Number(returnDetails.refundAmount) || 0,
            notes: `Return for order ${returnDetails.originalOrderId}`,
            attributes: {
                returnReason: returnDetails.items?.[0]?.reasons?.[0]?.reason || "Not Specified"
            }
        }];
    }
}