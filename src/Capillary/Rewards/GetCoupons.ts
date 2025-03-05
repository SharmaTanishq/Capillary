/**
 * Gets active coupons for a member
 * @param memberEmail The email of the member
 * @param token The authentication token
 * @returns Array of coupons formatted for Kibo
 */
export async function getActiveCoupons(memberEmail: string, token: string) {
    try {
        const response = await fetch(`${process.env.CAPILLARY_URL}/api/v1/loyalty/memberRewards/summary?member.email=${memberEmail}&options.UnRedeemedOnly=true&options.UnexpiredOnly=true`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept-Language': 'en',
            },
        });
        
        if (!response.ok) {
            const errorReason = await response.json();
            return { error: errorReason };
        }

        const data = await response.json();
        console.log("GetCoupons", data);

        const FilteredRewards = data.data.filter((reward: any) => reward.displayName === "$5 Reward");

        const responseForKibo = FilteredRewards.map((reward: any) => ({
            "code": `${reward.memberRewardId}`,
            "currencyCode": "USD",
            "customCreditType": 'LoyaltyRewards',
            "creditType": 'Custom',
            "initialBalance": 5,
            "currentBalance": 5,
            "isEnabled": true,
            "activationDate": `${reward.dateIssued}`,
        }));

        return responseForKibo;
    } catch (e) {
        throw new Error(`Failed to fetch coupons: ${e}`);
    }
} 