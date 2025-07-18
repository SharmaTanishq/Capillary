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
                    message: "Return order not found"
                };
            }

            // Extract identifierValue (externalId or fallback)
            const identifierValue = returnDetails.contact?.email || "";
            if (!identifierValue) {
                return {
                    success: false,
                    message: "Customer email not found in return details"
                };
            }

            const customerExists = await doesCustomerExist(identifierValue);

            // Map return payment modes
            const paymentModes: CapillaryReturnPaymentMode[] = this.mapReturnPaymentModes(returnDetails);

            // Fetch original order details for billNumber and billingDate
            let billingDate = new Date().toISOString();
            let billNumber = "";
            if (returnDetails.originalOrderId) {
                try {
                    const originalOrder = await orderClient.getOrder({ orderId: returnDetails.originalOrderId });
                    billNumber = originalOrder?.externalId || "";
                    billingDate = new Date(originalOrder?.submittedDate || billingDate).toISOString().split('.')[0] + "Z";
                } catch (e) {
                    // If fetching original order fails, fallback to defaults
                }
            }

            // Map return line items
            let lineItems: CapillaryReturnLineItem[] = [];
            try {
                lineItems = this.mapReturnLineItems(returnDetails, billNumber) || [];
            } catch (e) {
                lineItems = [];
            }

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
                billingDate: billingDate,
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
        const tenders = (returnDetails?.payments || []).map((payment: any) => {
            let interaction: any;

            if (payment.paymentType === "StoreCredit" && payment.data?.isPosTransaction) {
                // If Only Dummy Amount is present and Actual Amount is not present
                if (payment.data?.dummyAmount && !payment.data?.actualAmount) {
                    interaction = payment.interactions?.filter(
                        (interaction: any) =>
                            interaction.interactionType === "Credit" &&
                            interaction.returnId === returnDetails?.id &&
                            Number(payment.data?.dummyAmount).toFixed(2) === Number(interaction.amount).toFixed(2)
                    );
                }
                // If Both Dummy and Actual Amount is present then check if they are equal if not exit.
                if (payment.data?.dummyAmount && payment.data?.actualAmount) {
                    if (Number(payment.data?.dummyAmount).toFixed(2) === Number(payment.data?.actualAmount).toFixed(2)) {
                        // If dummy and actual are equal, get 1 interaction
                        interaction = payment.interactions?.filter(
                            (interaction: any) =>
                                interaction.interactionType === "Credit" &&
                                interaction.returnId === returnDetails?.id &&
                                Number(payment.data?.actualAmount).toFixed(2) === Number(interaction.amount).toFixed(2)
                        )[0];
                    } else {
                        // If dummy and actual are not equal, get interactions where actual == interaction amount
                        interaction = payment.interactions?.filter(
                            (interaction: any) =>
                                interaction.interactionType === "Credit" &&
                                interaction.returnId === returnDetails?.id &&
                                Number(payment.data?.actualAmount).toFixed(2) === Number(interaction.amount).toFixed(2)
                        );
                    }
                }
                // If Only Actual Amount is present
                if (!payment.data?.dummyAmount && payment.data?.actualAmount) {
                    interaction = payment.interactions?.filter(
                        (interaction: any) =>
                            interaction.interactionType === "Credit" &&
                            interaction.returnId === returnDetails?.id &&
                            Number(payment.data?.actualAmount).toFixed(2) === Number(interaction.amount).toFixed(2)
                    );
                }
            } else {
                interaction = payment.interactions?.filter(
                    (interaction: any) =>
                        interaction.interactionType === "Credit" &&
                        interaction.returnId === returnDetails?.id
                );
            }

            // Always get the first interaction's amount, or 0 if not found
            const interactionAmount = Array.isArray(interaction) ? interaction?.[0]?.amount : interaction?.amount || 0;

            return {
                mode: getTenderTypeCode(payment.paymentType || "", payment.billingInfo?.card?.paymentOrCardType || ""),
                value: -Number(interactionAmount) || 0
            };
        });
        return tenders;
    }
}