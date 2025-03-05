import { getActiveCoupons } from '../../Capillary/Rewards/GetCoupons';
import { CapillaryCouponResponse, KiboCoupon } from '../../types';

// Mock global fetch
global.fetch = jest.fn();

describe('GetCoupons', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return coupons for a valid email', async () => {
    // Mock response data
    const mockResponseData: CapillaryCouponResponse = {
      entity: {
        pagination: {
          limit: "100",
          offset: "0",
          total: 1
        },
        customers: [
          {
            firstname: "Test",
            lastname: "User",
            email: "shokri@wooomail.com",
            mobile: "1234567890",
            id: 123456,
            externalId: "12345",
            coupons: [
              {
                code: "12345",
                seriesId: 1,
                description: "Test Reward",
                validTill: "2025-01-01T00:00:00Z",
                discountType: "ABS",
                discountValue: 5,
                discountUpto: 0,
                redemptionCount: 0,
                redemptionsLeft: 1,
                id: 12345,
                createdDate: "2023-01-01T00:00:00Z",
                transactionNumber: "0",
                issuedAt: {
                  code: "test.code",
                  name: "Test Name"
                },
                customProperty: [],
                redemptions: [],
                reversedRedemptions: []
              }
            ]
          }
        ]
      },
      warnings: [],
      errors: [],
      success: true
    };

    // Mock successful fetch response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockResponseData)
    });

    // Call the function with test email
    const result = await getActiveCoupons('shokri@wooomail.com', 'test-token');

    // Verify fetch was called with correct parameters
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('email=shokri@wooomail.com'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'X-CAP-API-OAUTH-TOKEN': 'test-token'
        })
      })
    );

    // Verify the result is formatted correctly
    expect(result).toEqual([
      {
        code: "12345",
        currencyCode: "USD",
        customCreditType: 'LoyaltyRewards',
        creditType: 'Custom',
        initialBalance: 5,
        currentBalance: 5,
        isEnabled: true,
        activationDate: "2023-01-01T00:00:00Z"
      }
    ]);
  });

  it('should return empty array when no coupons are available', async () => {
    // Mock empty response data
    const mockResponseData: CapillaryCouponResponse = {
      entity: {
        pagination: {
          limit: "100",
          offset: "0",
          total: 1
        },
        customers: [
          {
            firstname: "Test",
            lastname: "User",
            email: "shokri@wooomail.com",
            mobile: "1234567890",
            id: 123456,
            externalId: "12345",
            coupons: []
          }
        ]
      },
      warnings: [],
      errors: [],
      success: true
    };

    // Mock successful fetch response with empty data
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockResponseData)
    });

    // Call the function with test email
    const result = await getActiveCoupons('shokri@wooomail.com', 'test-token');

    // Verify fetch was called with correct parameters
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('email=shokri@wooomail.com'),
      expect.objectContaining({
        method: 'GET'
      })
    );

    // Verify the result is an empty array
    expect(result).toEqual([]);
  });

  it('should return empty array when no customers are found', async () => {
    // Mock empty customers response
    const mockResponseData: CapillaryCouponResponse = {
      entity: {
        pagination: {
          limit: "100",
          offset: "0",
          total: 0
        },
        customers: []
      },
      warnings: [],
      errors: [],
      success: true
    };

    // Mock successful fetch response with no customers
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockResponseData)
    });

    // Call the function with test email
    const result = await getActiveCoupons('shokri@wooomail.com', 'test-token');

    // Verify the result is an empty array
    expect(result).toEqual([]);
  });

  it('should handle API errors gracefully', async () => {
    // Mock error response
    const mockErrorResponse = {
      error: 'Invalid request',
      message: 'Something went wrong'
    };

    // Mock failed fetch response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValueOnce(mockErrorResponse)
    });

    // Call the function with test email
    const result = await getActiveCoupons('shokri@wooomail.com', 'test-token');

    // Verify the result contains the error
    expect(result).toEqual({ error: mockErrorResponse });
  });

  it('should throw an error when fetch fails', async () => {
    // Mock fetch rejection
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    // Expect the function to throw an error
    await expect(getActiveCoupons('shokri@wooomail.com', 'test-token'))
      .rejects
      .toThrow('Failed to fetch coupons: Error: Network error');
  });

  // Specific test for shokri@wooomail.com
  it('should specifically test email shokri@wooomail.com', async () => {
    // Mock empty response for this specific email
    const mockResponseData: CapillaryCouponResponse = {
      entity: {
        pagination: {
          limit: "100",
          offset: "0",
          total: 0
        },
        customers: []
      },
      warnings: [],
      errors: [],
      success: true
    };

    // Mock successful fetch response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockResponseData)
    });

    // Call the function with the specific email
    const result = await getActiveCoupons('shokri@wooomail.com', 'test-token');

    // Verify the API was called with the correct email
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('email=shokri@wooomail.com'),
      expect.any(Object)
    );

    // Check if result is as expected (empty array in this case)
    // First check if it's an array (not an error response)
    if (Array.isArray(result)) {
      expect(result.length).toBe(0);
    } else {
      fail('Expected an array but got an error response');
    }
  });
}); 