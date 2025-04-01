import { TokenService } from '../TokenService';
import { CapillaryTransactionResponse, CapillaryTransactionParams } from './types';

/**
 * Send return details to Capillary
 * @param returnData The mapped return data to send to Capillary
 * @returns Response from Capillary API
 */
export const sendReturnDetails = async (returnData: any): Promise<CapillaryTransactionResponse> => {
    try {
        if (!process.env.CAPILLARY_URL) {
            throw new Error('CAPILLARY_URL environment variable is not set');
        }

        const tokenService = TokenService.getInstance();
        const token = await tokenService.getToken();

        // Prepare query parameters
        const params: CapillaryTransactionParams = {
            source: "INSTORE",
            identifierName: "email",
            identifierValue: returnData.identifierValue
        };

        // Build query string
        const queryString = Object.entries(params)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');

        // Construct the URL properly
        const baseUrl = process.env.CAPILLARY_URL.endsWith('/')
            ? process.env.CAPILLARY_URL.slice(0, -1)
            : process.env.CAPILLARY_URL;
        
        const url = `${baseUrl}/v2/transactions?${queryString}`;
        
        console.log('Sending request to:', url);
        
        const response = await fetch(
            url,
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CAP-API-OAUTH-TOKEN': token,
                    'Accept-Language': 'en'
                },
                body: JSON.stringify(returnData)
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error sending return to Capillary:', errorData);
            return {
                success: false,
                message: "Failed to send return to Capillary",
                error: errorData
            };
        }

        const responseData = await response.json();
        return {
            success: true,
            message: "Return sent to Capillary successfully",
            data: responseData
        };

    } catch (error) {
        console.error('Error in sendReturnDetails:', error);
        if (error instanceof Error) {
            console.error('Error stack:', error.stack);
        }
        return {
            success: false,
            message: `Error sending return details: ${error instanceof Error ? error.message : String(error)}`
        };
    }
};