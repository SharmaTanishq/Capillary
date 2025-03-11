import doesCustomerExist from '../../Capillary/Customer';
import { TokenService } from '../../Capillary/TokenService';

// Mock fetch
global.fetch = jest.fn();

// Mock TokenService
jest.mock('../../Capillary/TokenService', () => ({
    TokenService: {
        getInstance: jest.fn().mockReturnValue({
            getToken: jest.fn().mockResolvedValue('mock-token-123')
        })
    }
}));

describe('doesCustomerExist', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return true when customer exists', async () => {
        // Mock successful response
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: jest.fn().mockResolvedValueOnce({
                entity: 106831096,
                warnings: []
            })
        });

        const result = await doesCustomerExist('existing@example.com');
        
        expect(result).toBe(true);
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('identifierValue=existing%40example.com'),
            expect.objectContaining({
                method: 'GET',
                headers: expect.objectContaining({
                    'X-CAP-API-OAUTH-TOKEN': 'mock-token-123'
                })
            })
        );
    });

    it('should return false when customer does not exist', async () => {
        // Mock error response for non-existent customer
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: jest.fn().mockResolvedValueOnce({
                errors: [
                    {
                        status: false,
                        code: 8015,
                        message: "Customer not found for the given identifiers"
                    }
                ]
            })
        });

        const result = await doesCustomerExist('nonexistent@example.com');
        
        expect(result).toBe(false);
    });

    it('should return false when API request fails', async () => {
        // Mock failed fetch request
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        const result = await doesCustomerExist('test@example.com');
        
        expect(result).toBe(false);
    });

    it('should return false when API returns unexpected response', async () => {
        // Mock unexpected response format
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: jest.fn().mockResolvedValueOnce({
                unexpectedField: 'unexpected value'
            })
        });

        const result = await doesCustomerExist('test@example.com');
        
        expect(result).toBe(false);
    });

    it('should properly encode email in URL', async () => {
        // Mock successful response
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: jest.fn().mockResolvedValueOnce({
                entity: 106831096,
                warnings: []
            })
        });

        const email = 'test+special@example.com';
        await doesCustomerExist(email);
        
        // Verify the email was properly encoded in the URL
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('identifierValue=test%2Bspecial%40example.com'),
            expect.any(Object)
        );
    });

    it('should use TokenService to get authentication token', async () => {
        // Mock successful response
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: jest.fn().mockResolvedValueOnce({
                entity: 106831096,
                warnings: []
            })
        });

        await doesCustomerExist('test@example.com');
        
        // Verify TokenService was used
        expect(TokenService.getInstance).toHaveBeenCalled();
        expect(TokenService.getInstance().getToken).toHaveBeenCalled();
    });

    it('should specifically test email shokri@wooomail.com', async () => {
        // Mock successful response for specific email
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: jest.fn().mockResolvedValueOnce({
                entity: 106831096,
                warnings: []
            })
        });

        const result = await doesCustomerExist('shokri@wooomail.com');
        
        expect(result).toBe(true);
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('identifierValue=shokri%40wooomail.com'),
            expect.any(Object)
        );
    });
}); 