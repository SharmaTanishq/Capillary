import { TokenService } from '../../Capillary/TokenService';
import { CapillaryAuth } from '../../Capillary/Auth';

// Mock the CapillaryAuth class
jest.mock('../../Capillary/Auth');

describe('TokenService', () => {
  let tokenService: TokenService;
  let mockAuthorize: jest.Mock;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Reset the TokenService singleton
    TokenService.resetInstance();
    
    // Setup mock implementation
    mockAuthorize = jest.fn().mockResolvedValue('mock-token-123');
    (CapillaryAuth as jest.MockedClass<typeof CapillaryAuth>).prototype.authorize = mockAuthorize;
    
    // Get a fresh instance
    tokenService = TokenService.getInstance();
  });

  it('should be a singleton', () => {
    const instance1 = TokenService.getInstance();
    const instance2 = TokenService.getInstance();
    
    expect(instance1).toBe(instance2);
  });

  it('should fetch a new token when getToken is called for the first time', async () => {
    const token = await tokenService.getToken();
    
    // Verify token is returned
    expect(token).toBe('mock-token-123');
    
    // Verify authorize was called
    expect(mockAuthorize).toHaveBeenCalledTimes(1);
  });

  it('should return cached token on subsequent calls within expiry period', async () => {
    // First call should make the API request
    const token1 = await tokenService.getToken();
    expect(token1).toBe('mock-token-123');
    expect(mockAuthorize).toHaveBeenCalledTimes(1);
    
    // Second call should use cached token
    const token2 = await tokenService.getToken();
    expect(token2).toBe('mock-token-123');
    
    // authorize should still only be called once
    expect(mockAuthorize).toHaveBeenCalledTimes(1);
  });

  it('should fetch a new token when the cached token expires', async () => {
    // Mock Date.now to control time
    const originalDateNow = Date.now;
    
    try {
      // First call at time 0
      Date.now = jest.fn().mockReturnValue(0);
      const token1 = await tokenService.getToken();
      expect(token1).toBe('mock-token-123');
      expect(mockAuthorize).toHaveBeenCalledTimes(1);
      
      // Second call still within expiry (22 hours later)
      Date.now = jest.fn().mockReturnValue(22 * 60 * 60 * 1000);
      const token2 = await tokenService.getToken();
      expect(token2).toBe('mock-token-123');
      expect(mockAuthorize).toHaveBeenCalledTimes(1);
      
      // Third call after expiry (24 hours later)
      Date.now = jest.fn().mockReturnValue(24 * 60 * 60 * 1000);
      const token3 = await tokenService.getToken();
      expect(token3).toBe('mock-token-123');
      
      // authorize should be called again
      expect(mockAuthorize).toHaveBeenCalledTimes(2);
    } finally {
      // Restore original Date.now
      Date.now = originalDateNow;
    }
  });

  it('should handle multiple concurrent token requests efficiently', async () => {
    // Make multiple concurrent requests
    const promises = [
      tokenService.getToken(),
      tokenService.getToken(),
      tokenService.getToken()
    ];
    
    const results = await Promise.all(promises);
    
    // All should return the same token
    expect(results).toEqual(['mock-token-123', 'mock-token-123', 'mock-token-123']);
    
    // authorize should only be called once
    expect(mockAuthorize).toHaveBeenCalledTimes(1);
  });
}); 