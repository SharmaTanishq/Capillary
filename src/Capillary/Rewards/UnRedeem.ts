import { UnredeemCouponResponse } from '../../types';

/**
 * Unredeems a reward by its ID
 * @param rewardId The ID of the reward to unredeem
 * @param token The authentication token
 * @returns The response data or error
 */
export async function unredeemCoupon(rewardId: string, token: string): Promise<UnredeemCouponResponse> {
    try {
        const response = await fetch(`${process.env.CAPILLARY_URL}/api/v1/loyalty/memberRewards/${rewardId}/unredeem`, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CAP-API-OAUTH-TOKEN': `${token}`,
                'Accept-Language': 'en',
            },
            body: JSON.stringify({})
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