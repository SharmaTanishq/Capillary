import { unredeemCoupon } from '../../Capillary/Rewards/UnRedeem';

// Mock fetch
global.fetch = jest.fn();

describe('unredeemCoupon', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should format request body correctly', async () => {
        // Mock successful response
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: jest.fn().mockResolvedValueOnce({ success: true })
        });

        const params = {
            redemptionId: '12345'
        };

        await unredeemCoupon(params, 'test-token');

        // Verify the request body format
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/v2/coupon/reactivate'),
            expect.objectContaining({
                method: 'PATCH',
                headers: expect.objectContaining({
                    'X-CAP-API-OAUTH-TOKEN': 'test-token'
                }),
                body: JSON.stringify({
                    redemptionIds: ['12345']
                })
            })
        );

        // Parse the request body to verify its structure
        const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
        const requestBody = JSON.parse(callArgs.body);

        expect(requestBody).toEqual({
            redemptionIds: ['12345']
        });
    });

    it('should handle API errors correctly', async () => {
        // Mock error response
        const errorResponse = {
            errors: [{ message: 'Invalid redemption ID' }]
        };
        
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: jest.fn().mockResolvedValueOnce(errorResponse)
        });

        const params = {
            redemptionId: 'invalid-id'
        };

        const result = await unredeemCoupon(params, 'test-token');
        expect(result).toEqual({ error: errorResponse });
    });

    it('should throw error for network failures', async () => {
        // Mock network error
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        const params = {
            redemptionId: '12345'
        };

        await expect(unredeemCoupon(params, 'test-token'))
            .rejects
            .toThrow('Failed to unredeem coupon: Error: Network error');
    });

    it('should always send redemptionId as array with single value', async () => {
        // Mock successful response
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: jest.fn().mockResolvedValueOnce({ success: true })
        });

        const params = {
            redemptionId: '12345'
        };

        await unredeemCoupon(params, 'test-token');

        // Parse the request body to verify array format
        const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
        const requestBody = JSON.parse(callArgs.body);

        expect(Array.isArray(requestBody.redemptionIds)).toBe(true);
        expect(requestBody.redemptionIds.length).toBe(1);
        expect(requestBody.redemptionIds[0]).toBe('12345');
    });
}); 