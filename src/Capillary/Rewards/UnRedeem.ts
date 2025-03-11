import { UnredeemCouponResponse } from '../../types';

interface UnredeemCouponParams {
    redemptionId: string;
}

/**
 * Unredeems a reward by its redemption ID
 * @param params The parameters for unredeeeming the coupon
 * @param token The authentication token
 * @returns The response data or error
 */
export async function unredeemCoupon(params: UnredeemCouponParams, token: string): Promise<UnredeemCouponResponse> {
    try {
        const requestBody = {
            redemptionIds: [params.redemptionId]
        };

        const response = await fetch(`${process.env.CAPILLARY_URL}/v2/coupon/reactivate`, {
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
        throw new Error(`Failed to unredeem coupon: ${e}`);
    }
} 