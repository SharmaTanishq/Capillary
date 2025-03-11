import { sendOrderDetails } from '../../Capillary/Transactions/SendOrderDetails';
import { KiboToCapillaryOrderMapper } from '../../Capillary/Transactions/KiboCapillaryOrderMapper';
import { TokenService } from '../../Capillary/TokenService';

// Mock fetch
global.fetch = jest.fn();

// Mock TokenService and KiboToCapillaryOrderMapper
jest.mock('../../Capillary/TokenService');
jest.mock('../../Capillary/Transactions/KiboToCapillaryOrderMapper');

describe('sendOrderDetails', () => {
    const mockToken = 'mock-token';
    const mockOrderId = 'ORDER123';
    const mockCapillaryData = {
        identifierType: 'email',
        identifierValue: 'customer@example.com',
        billNumber: mockOrderId,
        billAmount: '100',
        lineItemsV2: [],
        paymentModes: []
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Mock TokenService.getInstance() to return an object with getToken method
        (TokenService.getInstance as jest.Mock).mockReturnValue({
            getToken: jest.fn().mockResolvedValue(mockToken)
        });
    });

    it('should successfully send order details to Capillary', async () => {
        // Mock successful mapping
        (KiboToCapillaryOrderMapper.mapOrderToCapillaryFormat as jest.Mock).mockResolvedValue({
            success: true,
            data: mockCapillaryData
        });

        // Mock successful API call
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: jest.fn().mockResolvedValueOnce({
                status: {
                    success: true,
                    code: 200,
                    message: 'Transaction added successfully'
                }
            })
        });

        const result = await sendOrderDetails(mockOrderId);

        expect(result.success).toBe(true);
        expect(result.message).toBe('Transaction sent to Capillary successfully');
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/v2/transactions'),
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    'X-CAP-API-OAUTH-TOKEN': mockToken
                }),
                body: expect.any(String)
            })
        );
    });

    it('should handle mapping failure', async () => {
        (KiboToCapillaryOrderMapper.mapOrderToCapillaryFormat as jest.Mock).mockResolvedValue({
            success: false,
            message: 'Mapping failed'
        });

        const result = await sendOrderDetails(mockOrderId);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Mapping failed');
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should handle API errors', async () => {
        (KiboToCapillaryOrderMapper.mapOrderToCapillaryFormat as jest.Mock).mockResolvedValue({
            success: true,
            data: mockCapillaryData
        });

        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

        const result = await sendOrderDetails(mockOrderId);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Error sending order details: API Error');
    });

    it('should handle token retrieval failure', async () => {
        // Mock token retrieval failure
        (TokenService.getInstance as jest.Mock).mockReturnValue({
            getToken: jest.fn().mockRejectedValue(new Error('Token Error'))
        });

        const result = await sendOrderDetails(mockOrderId);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Error sending order details: Token Error');
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should handle Capillary API failure response', async () => {
        (KiboToCapillaryOrderMapper.mapOrderToCapillaryFormat as jest.Mock).mockResolvedValue({
            success: true,
            data: mockCapillaryData
        });

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: jest.fn().mockResolvedValueOnce({
                status: {
                    success: false,
                    code: 400,
                    message: 'Invalid transaction data'
                }
            })
        });

        const result = await sendOrderDetails(mockOrderId);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Failed to send transaction to Capillary');
    });
}); 