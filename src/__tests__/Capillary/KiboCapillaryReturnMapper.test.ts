import { KiboCapillaryReturnMapper } from '../../Capillary/Transactions/KiboCapillaryReturnMapper';
import { getOrderDetailsById } from '../../KIBO/OrderDetails';
import { SAMPLE_RETURN } from './sampleReturn';
// Mock the getOrderDetailsById function
jest.mock('../../KIBO/OrderDetails');


describe('KiboCapillaryReturnMapper', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should map a valid Kibo return to Capillary format', async () => {
        // Mock return order details
        const mockReturn = {
            synthesized: {
                id: 'RETURN123',
                email: 'customer@example.com',
                total: 100,
                submittedDate: '2024-03-20T10:30:00Z',
                items: [
                    {
                        id: 'ITEM1',
                        product: {
                            name: 'Test Product',
                            productCode: 'PROD123',
                            variationProductCode: 'SKU123'
                        },
                        total: 50,
                        quantity: 2,
                        unitPrice: {
                            saleAmount: 25
                        },
                        returnReason: 'Size too small'
                    }
                ],
                billingInfo: {
                    paymentType: 'CreditCard'
                }
            },
            unSynthesized: {
                id: 'RETURN123',
                total: 100,
                submittedDate: '2024-03-20T10:30:00Z',
                returnReason: 'Size too small',
                originalOrderId: 'ORDER123',
                billingInfo: {
                    paymentType: 'CreditCard'
                }
            }
        };

        (getOrderDetailsById as jest.Mock).mockResolvedValueOnce(mockReturn);

        const result = await KiboCapillaryReturnMapper.mapReturnToCapillaryFormat(SAMPLE_RETURN);

        expect(result.success).toBe(true);
        expect(result.data).toEqual({
            identifierType: 'email',
            identifierValue: 'customer@example.com',
            source: 'Instore',
            addWithLocalCurrency: false,
            type: 'RETURN',
            billAmount: '100',
            billNumber: 'RETURN123',
            lineItemsV2: [
                {
                    description: 'Test Product',
                    discount: null,
                    itemCode: 'PROD123',
                    amount: -50,
                    qty: '2',
                    rate: -25,
                    serial: 1,
                    value: '-50',
                    extendedFields: {
                        sku: 'SKU123',
                        returnReason: 'Size too small'
                    }
                }
            ],
            paymentModes: [
                {
                    mode: 'CreditCard',
                    value: -100,
                    notes: 'Return for order ORDER123',
                    attributes: {
                        returnReason: 'Size too small'
                    }
                }
            ],
            extendedFields: {
                orderSource: 'Kibo Commerce',
                orderDate: '2024-03-20T10:30:00Z',
                returnReason: 'Size too small',
                originalOrderId: 'ORDER123'
            }
        });
    });

    it('should handle missing return order', async () => {
        (getOrderDetailsById as jest.Mock).mockResolvedValueOnce(null);

        const result = await KiboCapillaryReturnMapper.mapReturnToCapillaryFormat(SAMPLE_RETURN);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Return order not found');
    });

    it('should handle missing email', async () => {
        const mockReturn = {
            synthesized: {
                id: 'RETURN123',
                total: 100
            },
            unSynthesized: {
                id: 'RETURN123',
                total: 100
            }
        };

        (getOrderDetailsById as jest.Mock).mockResolvedValueOnce(mockReturn);

        const result = await KiboCapillaryReturnMapper.mapReturnToCapillaryFormat(SAMPLE_RETURN);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Customer email not found in return details');
    });

    it('should handle API errors', async () => {
        (getOrderDetailsById as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

        const result = await KiboCapillaryReturnMapper.mapReturnToCapillaryFormat(SAMPLE_RETURN);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Error mapping return order: API Error');
    });

    it('should handle missing line items', async () => {
        const mockReturn = {
            synthesized: {
                id: 'RETURN123',
                email: 'customer@example.com',
                total: 100,
                submittedDate: '2024-03-20T10:30:00Z'
            },
            unSynthesized: {
                id: 'RETURN123',
                total: 100,
                submittedDate: '2024-03-20T10:30:00Z'
            }
        };

        (getOrderDetailsById as jest.Mock).mockResolvedValueOnce(mockReturn);

        const result = await KiboCapillaryReturnMapper.mapReturnToCapillaryFormat(SAMPLE_RETURN);

        expect(result.success).toBe(true);
        expect(result.data?.lineItemsV2).toEqual([]);
    });
});

describe('KiboCapillaryReturnMapper.mapReturnPaymentModes', () => {
  const baseReturn = { id: 'RET1' };
  const getMode = (type: string) => {
    if (type === 'StoreCredit') return 'PROGRAM REWARD';
    if (type === 'CreditCard') return 'CREDIT CARD';
    if (type === 'GiftCard') return 'GIFT CARD';
    return type.toUpperCase();
  };

  it('should map standard CreditCard payment with Credit interaction', () => {
    const payments = [
      {
        paymentType: 'CreditCard',
        billingInfo: { card: { paymentOrCardType: 'MC' } },
        interactions: [
          { interactionType: 'Credit', returnId: 'RET1', amount: 42.5 }
        ]
      }
    ];
    const result = KiboCapillaryReturnMapper['mapReturnPaymentModes']({ ...baseReturn, payments });
    expect(result).toEqual([
      { mode: getMode('CreditCard'), value: -42.5 }
    ]);
  });

  it('should map StoreCredit with only dummyAmount present', () => {
    const payments = [
      {
        paymentType: 'StoreCredit',
        data: { isPosTransaction: true, dummyAmount: 10 },
        interactions: [
          { interactionType: 'Credit', returnId: 'RET1', amount: 10 }
        ]
      }
    ];
    const result = KiboCapillaryReturnMapper['mapReturnPaymentModes']({ ...baseReturn, payments });
    expect(result).toEqual([
      { mode: getMode('StoreCredit'), value: -10 }
    ]);
  });

  it('should map StoreCredit with dummyAmount and actualAmount present and equal', () => {
    const payments = [
      {
        paymentType: 'StoreCredit',
        data: { isPosTransaction: true, dummyAmount: 15, actualAmount: 15 },
        interactions: [
          { interactionType: 'Credit', returnId: 'RET1', amount: 15 }
        ]
      }
    ];
    const result = KiboCapillaryReturnMapper['mapReturnPaymentModes']({ ...baseReturn, payments });
    expect(result).toEqual([
      { mode: getMode('StoreCredit'), value: -15 }
    ]);
  });

  it('should map StoreCredit with dummyAmount and actualAmount present and not equal', () => {
    const payments = [
      {
        paymentType: 'StoreCredit',
        data: { isPosTransaction: true, dummyAmount: 20, actualAmount: 30 },
        interactions: [
          { interactionType: 'Credit', returnId: 'RET1', amount: 30 },
          { interactionType: 'Credit', returnId: 'RET1', amount: 20 }
        ]
      }
    ];
    const result = KiboCapillaryReturnMapper['mapReturnPaymentModes']({ ...baseReturn, payments });
    expect(result).toEqual([
      { mode: getMode('StoreCredit'), value: -30 }
    ]);
  });

  it('should map StoreCredit with only actualAmount present', () => {
    const payments = [
      {
        paymentType: 'StoreCredit',
        data: { isPosTransaction: true, actualAmount: 50 },
        interactions: [
          { interactionType: 'Credit', returnId: 'RET1', amount: 50 }
        ]
      }
    ];
    const result = KiboCapillaryReturnMapper['mapReturnPaymentModes']({ ...baseReturn, payments });
    expect(result).toEqual([
      { mode: getMode('StoreCredit'), value: -50 }
    ]);
  });

  it('should fallback for other payment types', () => {
    const payments = [
      {
        paymentType: 'GiftCard',
        billingInfo: { card: { paymentOrCardType: 'GC' } },
        interactions: [
          { interactionType: 'Credit', returnId: 'RET1', amount: 99 }
        ]
      }
    ];
    const result = KiboCapillaryReturnMapper['mapReturnPaymentModes']({ ...baseReturn, payments });
    expect(result).toEqual([
      { mode: getMode('GiftCard'), value: -99 }
    ]);
  });
}); 