import { RedeemCouponResponse } from '../../types';

interface RedeemCouponParams {
    email: string;
    billAmount?: string;
    code: string;
}

/**
 * Redeems a reward by its ID
 * @param params The parameters for redeeming the coupon
 * @param token The authentication token
 * @returns The response data or error
 */
export async function redeemCoupon(params: RedeemCouponParams, token: string): Promise<RedeemCouponResponse> {
    try {
        // Format current date in US format (MM/DD/YYYY HH:mm:ss)
        const now = new Date();
        const redemptionTime = now.toLocaleString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).replace(',', '');

        const requestBody = {
            redemptionRequestList: [
                {
                    code: params.code
                }
            ],
            user: {
                email: params.email
            },
            transactionNumber: "",
            billAmount: params.billAmount || "0",
            redemptionTime: redemptionTime
        };

        const response = await fetch(`${process.env.CAPILLARY_URL}/v2/coupon/redeem`, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CAP-API-OAUTH-TOKEN': `${token}`,
                'Accept-Language': 'en',
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorReason = await response.json();
            return { error: errorReason };
        }
        
        const data = await response.json();
        return { data };
    } catch (e) {
        throw new Error(`Failed to redeem coupon: ${e}`);
    }
} 