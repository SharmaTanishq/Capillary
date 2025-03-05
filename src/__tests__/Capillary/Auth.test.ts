import axios from 'axios';
import { CapillaryAuth, CapillaryAuthResponse } from '../../Capillary/Auth';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Helper to access private static properties for testing
const resetAuthTokens = () => {
  // @ts-ignore - accessing private static properties for testing
  CapillaryAuth.token = null;
  // @ts-ignore - accessing private static properties for testing
  CapillaryAuth.tokenExpiresAt = null;
};

describe('CapillaryAuth', () => {
  let auth: CapillaryAuth;
  
  beforeEach(() => {
    // Reset mocks and static variables
    jest.clearAllMocks();
    resetAuthTokens();
    auth = new CapillaryAuth();
  });

  it('should be defined', () => {
    expect(auth).toBeDefined();
  });

  it('should have the correct URL', () => {
    expect(auth.URL).toContain('/v3/oauth/token/generate');
  });

  it('should fetch a new token when authorize is called', async () => {
    // Mock successful response
    const mockResponse: { data: CapillaryAuthResponse } = {
      data: {
        data: {
          accessToken: 'mock-token-123',
          expiresIn: 3600,
          tokenType: 'Bearer'
        }
      }
    };
    
    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    const token = await auth.authorize();
    
    // Verify axios was called with correct parameters
    expect(mockedAxios.post).toHaveBeenCalledWith(
      auth.URL,
      {
        key: auth.CLIENT_ID,
        secret: auth.CLIENT_SECRET
      },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Verify token is returned
    expect(token).toBe('mock-token-123');
  });

  it('should return cached token if not expired', async () => {
    // Mock successful response for first call
    const mockResponse: { data: CapillaryAuthResponse } = {
      data: {
        data: {
          accessToken: 'mock-token-123',
          expiresIn: 3600, // 1 hour in seconds
          tokenType: 'Bearer'
        }
      }
    };
    
    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    // First call should make the API request
    const token1 = await auth.authorize();
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    expect(token1).toBe('mock-token-123');

    // Second call should use cached token
    const token2 = await auth.authorize();
    expect(mockedAxios.post).toHaveBeenCalledTimes(1); // Still only called once
    expect(token2).toBe('mock-token-123');
  });

  it('should handle API errors correctly', async () => {
    // Mock error response
    const errorMessage = 'Request failed with status code 401';
    const axiosError = {
      isAxiosError: true,
      response: {
        data: {},
        status: 401
      },
      message: errorMessage
    };
    
    mockedAxios.post.mockRejectedValueOnce(axiosError);

    await expect(auth.authorize()).rejects.toThrow(`Authorization failed: ${errorMessage}`);
  });

  it('should handle non-axios errors', async () => {
    // Mock a generic error
    const errorMessage = 'Network error';
    const genericError = new Error(errorMessage);
    
    mockedAxios.post.mockRejectedValueOnce(genericError);

    await expect(auth.authorize()).rejects.toThrow(`Authorization failed: ${errorMessage}`);
  });
}); 