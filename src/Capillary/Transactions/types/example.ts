import { CapillaryTransaction, CapillaryLineItem, CapillaryPaymentMode } from './index';

/**
 * Example of how to use the Capillary Transaction types
 */

// Example line items
const lineItems: CapillaryLineItem[] = [
    {
        description: "T-shirt",
        discount: null,
        itemCode: "111111111",
        amount: 400,
        qty: "2",
        rate: "200",
        serial: 1,
        value: "400",
        extendedFields: {
            amount_excluding_tax: 100,
            amount_including_tax: 120,
            vat_amount: 20,
            service_tax_amount: 10
        }
    },
    {
        description: "Cap",
        discount: null,
        itemCode: "222222222",
        amount: 300,
        qty: "2",
        rate: "150",
        serial: 2,
        value: "300",
        extendedFields: {
            amount_excluding_tax: 100,
            amount_including_tax: 120,
            vat_amount: 20,
            service_tax_amount: 10
        }
    }
];

// Example payment modes
const paymentModes: CapillaryPaymentMode[] = [
    {
        mode: "Credit",
        value: 750,
        notes: "Credit card payment",
        attributes: {
            cardType: "Visa",
            lastFour: "1234"
        }
    },
    {
        mode: "Cash",
        value: 0,
        notes: "No cash payment",
        attributes: {}
    }
];

// Complete transaction example
const exampleTransaction: CapillaryTransaction = {
    identifierType: "email",
    identifierValue: "customer@example.com",
    source: "Instore",
    addWithLocalCurrency: false,
    type: "REGULAR",
    billAmount: "750",
    billNumber: "ORDER123456",
    lineItemsV2: lineItems,
    paymentModes: paymentModes,
    extendedFields: {
        amount_excluding_tax: 100,
        amount_including_tax: 120,
        vat_amount: 20,
        service_tax_amount: 10
    }
};

/**
 * Function demonstrating how to create a transaction object
 */
export function createSampleTransaction(
    email: string, 
    orderId: string, 
    totalAmount: number
): CapillaryTransaction {
    return {
        identifierType: "email",
        identifierValue: email,
        source: "Instore",
        addWithLocalCurrency: false,
        type: "REGULAR",
        billAmount: String(totalAmount),
        billNumber: orderId,
        lineItemsV2: lineItems, // Using the example line items
        paymentModes: [
            {
                mode: "Credit",
                value: totalAmount,
                notes: `Payment for order ${orderId}`,
                attributes: {}
            }
        ],
        extendedFields: {
            amount_excluding_tax: 100,
            amount_including_tax: 120,
            vat_amount: 20,
            service_tax_amount: 10
        }
    };
} 