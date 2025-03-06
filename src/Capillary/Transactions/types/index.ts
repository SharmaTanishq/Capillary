/**
 * Types for Capillary Transaction API
 */

/**
 * Extended fields for additional metadata
 */
export interface ExtendedFields {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Attributes for payment modes
 */
export interface PaymentAttributes {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Line item in a transaction
 */
export interface CapillaryLineItem {
  /** Description of the item */
  description: string;
  /** Discount applied to the item, if any */
  discount: number | null;
  /** Unique identifier for the item */
  itemCode: string;
  /** Total amount for this line item */
  amount: number;
  /** Quantity of items */
  qty: string | number;
  /** Price per unit */
  rate: string | number;
  /** Serial number or position in the order */
  serial: number;
  /** Total value (may be same as amount) */
  value: string | number;
  /** Additional fields specific to this line item */
  extendedFields: ExtendedFields;
}

/**
 * Payment mode details
 */
export interface CapillaryPaymentMode {
  /** Type of payment (Credit, Cash, Rewards, etc.) */
  mode: string;
  /** Amount paid using this payment mode */
  value: number;
  /** Additional notes about this payment */
  notes: string;
  /** Additional attributes for this payment mode */
  attributes: PaymentAttributes;
}

/**
 * Complete transaction data structure for Capillary API
 */
export interface CapillaryTransaction {
  /** Type of identifier used (email, mobile, etc.) */
  identifierType: string;
  /** Value of the identifier (actual email, phone number, etc.) */
  identifierValue: string;
  /** Source of the transaction (Instore, Online, etc.) */
  source: string;
  /** Whether to add with local currency */
  addWithLocalCurrency: boolean;
  /** Type of transaction (REGULAR, RETURN, etc.) */
  type: 'REGULAR' | 'RETURN' | string;
  /** Total bill amount */
  billAmount: string | number;
  /** Unique bill/invoice number */
  billNumber: string;
  /** Line items in the transaction */
  lineItemsV2: CapillaryLineItem[];
  /** Payment methods used */
  paymentModes: CapillaryPaymentMode[];
  /** Additional fields for the transaction */
  extendedFields: ExtendedFields;
}

/**
 * Response from Capillary Transaction API
 */
export interface CapillaryTransactionResponse {
  /** Success status of the API call */
  success: boolean;
  /** Response data if successful */
  data?: any;
  /** Error information if unsuccessful */
  error?: any;
  /** Message describing the result */
  message?: string;
}

/**
 * Request parameters for transaction API
 */
export interface CapillaryTransactionParams {
  /** Source of the transaction */
  source: string;
  /** Type of identifier (email, mobile, etc.) */
  identifierName: string;
  /** Value of the identifier */
  identifierValue: string;
} 