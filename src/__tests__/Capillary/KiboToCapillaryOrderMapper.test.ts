import { Order } from '@kibocommerce/rest-sdk/clients/Commerce';
import { KiboToCapillaryOrderMapper } from '../../Capillary/Transactions/KiboCapillaryOrderMapper';
import { getOrderDetailsById } from '../../KIBO/OrderDetails';
import { sampleOrder } from './sampleOrder';

// Mock the getOrderDetailsById function
jest.mock('../../KIBO/OrderDetails');



describe('KiboToCapillaryOrderMapper', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should map a valid Kibo order to Capillary format', async () => {
        // Mock order details
       

        const result = await KiboToCapillaryOrderMapper.mapOrderToCapillaryFormat(sampleOrder, sampleOrder.items!);

        expect(result.success).toBe(true);
        expect(result.data).toEqual({
            identifierType: 'email',
            identifierValue: 'customer@example.com',
            source: 'Instore',
            addWithLocalCurrency: false,
            type: 'REGULAR',
            billAmount: '100',
            billNumber: 'ORDER123',
            lineItemsV2: [
                {
                    description: 'Test Product',
                    discount: null,
                    itemCode: 'ITEM1',
                    amount: 50,
                    qty: 2,
                    rate: 25,
                    serial: 1,
                    value: '50',
                    extendedFields: {
                        sku: 'SKU123'
                    }
                }
            ],
            paymentModes: [
                {
                    mode: 'CreditCard',
                    value: 100,
                    notes: 'Payment for order ORDER123',
                    attributes: {}
                }
            ],
            extendedFields: {
                orderSource: 'Kibo Commerce',
                orderDate: '2024-03-20T10:30:00Z'
            }
        });
    });

    it('should handle missing order', async () => {
        (getOrderDetailsById as jest.Mock).mockResolvedValueOnce(null);

        const result = await KiboToCapillaryOrderMapper.mapOrderToCapillaryFormat(sampleOrder, sampleOrder.items!);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Order not found');
    });

    it('should handle missing email', async () => {
        const mockOrder = {
            id: 'ORDER123',
            total: 100
        };

        (getOrderDetailsById as jest.Mock).mockResolvedValueOnce(mockOrder);

        const result = await KiboToCapillaryOrderMapper.mapOrderToCapillaryFormat(sampleOrder, sampleOrder.items!);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Customer email not found in order details');
    });

    it('should handle missing line items', async () => {
        const mockOrder = {
            id: 'ORDER123',
            email: 'customer@example.com',
            total: 100,
            submittedDate: '2024-03-20T10:30:00Z'
        };

        (getOrderDetailsById as jest.Mock).mockResolvedValueOnce(mockOrder);

        const result = await KiboToCapillaryOrderMapper.mapOrderToCapillaryFormat(sampleOrder, sampleOrder.items!);

        expect(result.success).toBe(true);
        expect(result.data?.lineItemsV2).toEqual([]);
    });

    it('should handle API errors', async () => {
        (getOrderDetailsById as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

        const result = await KiboToCapillaryOrderMapper.mapOrderToCapillaryFormat(sampleOrder, sampleOrder.items!);
        
        expect(result.success).toBe(false);
        expect(result.message).toContain('Error mapping order: API Error');
    });
}); 