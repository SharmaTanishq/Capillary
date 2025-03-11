import { redeemCoupon } from '../../Capillary/Rewards/Redeem';

// Mock fetch
global.fetch = jest.fn();

describe('redeemCoupon', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset timezone to ensure consistent date formatting
        jest.useFakeTimers().setSystemTime(new Date('2024-03-20T10:30:00'));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should format request body correctly', async () => {
        // Mock successful response
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: jest.fn().mockResolvedValueOnce({ success: true })
        });

        const params = {
            code: '650150',
            email: 'test@example.com',
            billAmount: '100'
        };

        await redeemCoupon(params, 'test-token');

        // Verify the request body format
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/v2/coupon/redeem'),
            expect.objectContaining({
                method: 'PATCH',
                headers: expect.objectContaining({
                    'X-CAP-API-OAUTH-TOKEN': 'test-token'
                }),
                body: expect.stringContaining('"redemptionRequestList":[{"code":"650150"}]')
            })
        );

        // Parse the request body to verify its structure
        const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
        const requestBody = JSON.parse(callArgs.body);

        expect(requestBody).toEqual({
            redemptionRequestList: [{ code: '650150' }],
            user: { email: 'test@example.com' },
            transactionNumber: '',
            billAmount: '100',
            redemptionTime: '03/20/2024 10:30:00'
        });
    });

    it('should handle API errors correctly', async () => {
        // Mock error response
        const errorResponse = {
            errors: [{ message: 'Invalid coupon code' }]
        };
        
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: jest.fn().mockResolvedValueOnce(errorResponse)
        });

        const params = {
            code: 'invalid-code',
            email: 'test@example.com'
        };

        const result = await redeemCoupon(params, 'test-token');
        expect(result).toEqual({ error: errorResponse });
    });

    it('should use default billAmount when not provided', async () => {
        // Mock successful response
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: jest.fn().mockResolvedValueOnce({ success: true })
        });

        const params = {
            code: '650150',
            email: 'test@example.com'
        };

        await redeemCoupon(params, 'test-token');

        // Parse the request body to verify default billAmount
        const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
        const requestBody = JSON.parse(callArgs.body);

        expect(requestBody.billAmount).toBe('0');
    });

    it('should format redemptionTime in US format', async () => {
        // Mock successful response
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: jest.fn().mockResolvedValueOnce({ success: true })
        });

        const params = {
            code: '650150',
            email: 'test@example.com'
        };

        await redeemCoupon(params, 'test-token');

        // Parse the request body to verify date format
        const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
        const requestBody = JSON.parse(callArgs.body);

        expect(requestBody.redemptionTime).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/);
        expect(requestBody.redemptionTime).toBe('03/20/2024 10:30:00');
    });

    it('should throw error for network failures', async () => {
        // Mock network error
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        const params = {
            code: '650150',
            email: 'test@example.com'
        };

        await expect(redeemCoupon(params, 'test-token'))
            .rejects
            .toThrow('Failed to redeem coupon: Error: Network error');
    });
}); 