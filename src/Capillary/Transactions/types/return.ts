export interface CapillaryReturnPayload {
  identifierType: string;
  identifierValue: string;
  source: string;
  
  type: string;
  returnType: string;
  billNumber: string;
  discount: number;
  billAmount: number;
  grossAmount: number;
  
  
  billingDate: string;
  
  
  paymentModes: CapillaryReturnPaymentMode[];
  lineItemsV2: CapillaryReturnLineItem[];
  customFields?: Record<string, any>;
  extendedFields?: Record<string, any>;
}

export interface CapillaryReturnPaymentMode {
  attributes?: Record<string, any> | null;
  notes?: string | null;
  mode: string;
  value: number;
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
  description?: string;
  serial?: number | string;
  extendedFields: {
    vat_amount?: number;
    service_tax_amount?: number;
    amount_including_tax?: number;
    amount_excluding_tax?: number;
    [key: string]: any;
  };
  customFields?: Record<string, any> | null;
  appliedPromotionIdentifiers?: string[];
} 