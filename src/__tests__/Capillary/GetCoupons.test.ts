import { getActiveCoupons } from '../../Capillary/Rewards/GetCoupons';

// Mock global fetch
global.fetch = jest.fn();

describe('GetCoupons', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return coupons for a valid email', async () => {
    // Mock response data
    const mockResponseData = {
      data: [
        {
          memberRewardId: '12345',
          dateIssued: '2023-01-01T00:00:00Z',
          displayName: 'Test Reward'
        }
      ]
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
        code: '12345',
        currencyCode: 'USD',
        customCreditType: 'LoyaltyRewards',
        creditType: 'Custom',
        initialBalance: 5,
        currentBalance: 5,
        isEnabled: true,
        activationDate: '2023-01-01T00:00:00Z'
      }
    ]);
  });

  it('should return empty array when no coupons are available', async () => {
    // Mock empty response data
    const mockResponseData = {
      data: []
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
    // This test can be run in two ways:
    // 1. With mock data (as shown below)
    // 2. With actual API call (commented out below)

    // OPTION 1: Using mock data
    const mockResponseData = {
      data: [] // Assuming no coupons for this user, adjust if needed
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
    expect(Array.isArray(result)).toBe(true);

    /* 
    // OPTION 2: Using actual API call (uncomment to use)
    // Note: This requires actual credentials and will make a real API call
    // Not recommended for automated tests but useful for manual verification
    
    // Get a real token
    // const tokenService = TokenService.getInstance();
    // const token = await tokenService.getToken();
    
    // Make the actual API call
    // const result = await getActiveCoupons('shokri@wooomail.com', token);
    
    // Log the result for inspection
    // console.log('API result for shokri@wooomail.com:', result);
    
    // Verify the result structure
    // expect(Array.isArray(result)).toBe(true);
    // If we expect no coupons:
    // expect(result.length).toBe(0);
    */
  });
}); 