/**
 * Redeems a reward by its ID
 * @param rewardId The ID of the reward to redeem
 * @param token The authentication token
 * @returns The response data or error
 */
export async function redeemCoupon(rewardId: string, token: string) {
    try {
        const response = await fetch(`${process.env.CAPILLARY_URL}/api/v1/loyalty/memberRewards/${rewardId}/redeem`, {
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
        return data;
    } catch (e) {
        throw new Error(`Failed to redeem coupon: ${e}`);
    }
} 