import { KiboCapillaryReturnMapper } from '../../Capillary/Transactions/KiboCapillaryReturnMapper';
import { getOrderDetailsById } from '../../KIBO/OrderDetails';

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

        const result = await KiboCapillaryReturnMapper.mapReturnToCapillaryFormat('RETURN123');

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

        const result = await KiboCapillaryReturnMapper.mapReturnToCapillaryFormat('INVALID_RETURN');

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

        const result = await KiboCapillaryReturnMapper.mapReturnToCapillaryFormat('RETURN123');

        expect(result.success).toBe(false);
        expect(result.message).toBe('Customer email not found in return details');
    });

    it('should handle API errors', async () => {
        (getOrderDetailsById as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

        const result = await KiboCapillaryReturnMapper.mapReturnToCapillaryFormat('RETURN123');

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

        const result = await KiboCapillaryReturnMapper.mapReturnToCapillaryFormat('RETURN123');

        expect(result.success).toBe(true);
        expect(result.data?.lineItemsV2).toEqual([]);
    });
}); 