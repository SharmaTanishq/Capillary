export interface CapillaryReturnPayload {
  identifierType: string;
  identifierValue: string;
  source: string;
  accountId: string | null;
  type: string;
  returnType: string;
  billNumber: string;
  discount: number;
  billAmount: string;
  note: string;
  grossAmount: number | null;
  deliveryStatus: string | null;
  purchaseTime: string | null;
  billingDate: string;
  currencyCode: string;
  appliedPromotionIdentifiers: string[];
  paymentModes: CapillaryReturnPaymentMode[];
  lineItemsV2: CapillaryReturnLineItem[];
  customFields?: Record<string, any>;
  extendedFields?: Record<string, any>;
}

export interface CapillaryReturnPaymentMode {
  attributes: Record<string, any> | null;
  notes: string | null;
  mode: string;
  value: string;
}

export interface CapillaryReturnLineItem {
  type?: string;
  parentBillNumber?: string;
  itemCode: string;
  amount: number;
  rate: number;
  returnType: "LINE_ITEM",
  discount: number;
  value: number | string;
  qty: number | string;
  description: string;
  serial: number | string;
  extendedFields: {
    vat_amount?: number;
    service_tax_amount?: number;
    amount_including_tax?: number;
    amount_excluding_tax?: number;
    [key: string]: any;
  };
  customFields: Record<string, any> | null;
  appliedPromotionIdentifiers: string[];
} 