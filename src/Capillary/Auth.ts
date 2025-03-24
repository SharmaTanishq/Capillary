import dotenv from 'dotenv';
import axios, { AxiosError } from 'axios';

// Load environment variables
dotenv.config();

export interface CapillaryAuthResponse {
    data: {
        accessToken: string;
        expiresIn: number;
        tokenType: string;
    };
}

export class CapillaryAuth {
    public readonly URL = process.env.CAPILLARY_URL + "/v3/oauth/token/generate";
    public readonly CLIENT_ID = process.env.CAPILLARY_CLIENT_ID;
    public readonly CLIENT_SECRET = process.env.CAPILLARY_CLIENT_SECRET;  
    private static token: string | null = null;
    private static tokenExpiresAt: number | null = null;

    constructor() {}

    /**
     * Authorizes with Capillary API and returns an access token
     * @returns Promise with the access token
     */
    public async authorize(): Promise<string> {
        const now = Date.now();

        // Return cached token if it's still valid
        if (
            CapillaryAuth.token &&
            CapillaryAuth.tokenExpiresAt &&
            now < CapillaryAuth.tokenExpiresAt
        ) {
            return CapillaryAuth.token;
        }
       
        try {
            const response = await axios.post<CapillaryAuthResponse>(
                this.URL,
                {
                    key: this.CLIENT_ID,
                    secret: this.CLIENT_SECRET
                },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            const { data } = response;
            
            // Store token and calculate expiration time (subtract 60 seconds as buffer)
            CapillaryAuth.token = data.data.accessToken;
            CapillaryAuth.tokenExpiresAt = Date.now() + 3600 * 1000 - 60000;

            return CapillaryAuth.token;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<any>;
                const errorMessage = axiosError.response?.data?.message || axiosError.message;
                throw new Error(`Authorization failed: ${errorMessage}`);
            }
            throw new Error(`Authorization failed: ${(error as Error).message}`);
        }
    }
}