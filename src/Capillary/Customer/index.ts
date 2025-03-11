import { TokenService } from '../TokenService';

interface CapillaryErrorResponse {
    errors: Array<{
        status: boolean;
        code: number;
        message: string;
    }>;
}

interface CapillarySuccessResponse {
    entity: number;
    warnings: any[];
}

const doesCustomerExist = async (email: string): Promise<boolean> => {
    try {
        // Get authentication token
        const tokenService = TokenService.getInstance();
        const token = await tokenService.getToken();

        // Make API request to check if customer exists
        const response = await fetch(
            `${process.env.CAPILLARY_URL}/v2/customers/lookup?source=ALL&identifierName=email&identifierValue=${encodeURIComponent(email)}`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CAP-API-OAUTH-TOKEN': token,
                    'Accept-Language': 'en'
                }
            }
        );

        const data = await response.json() as CapillarySuccessResponse | CapillaryErrorResponse;

        // Check if the response contains errors array
        if ('errors' in data) {
            // Customer doesn't exist if we get error code 8015
            return false;
        }

        // Customer exists if we get an entity ID
        return true;
    } catch (error) {
        console.error('Error checking if customer exists:', error);
        return false;
    }
};

export default doesCustomerExist;