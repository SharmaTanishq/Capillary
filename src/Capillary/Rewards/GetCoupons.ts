/**
 * Gets active coupons for a member
 * @param memberEmail The email of the member
 * @param token The authentication token
 * @returns Array of coupons formatted for Kibo
 */
export async function getActiveCoupons(memberEmail: string, token: string) {
    try {
        const response = await fetch(`${process.env.CAPILLARY_URL}/v2/customers/coupons?email=${memberEmail}&status=Active_Unredeemed`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CAP-API-OAUTH-TOKEN': `Bearer ${token}`,
                'X-CAP-API-ATTRIBUTION-ENTITY-TYPE': "TILL",
                'X-CAP-API-ATTRIBUTION-ENTITY-CODE': "flt.100.015",
                'Accept-Language': 'en',
            },
        });
        
        if (!response.ok) {
            const errorReason = await response.json();
            return { error: errorReason };
        }

        const data = await response.json();
        
        // If no data or empty array, return empty array
        if (!data.data || data.data.length === 0) {
            return [];
        }
        
        //COMMENTED FILTERATION FOR $5 REWARD, CAPILLARY YET TO COMEBACK ON THIS
        //const filteredRewards = data.data.filter((reward: any) => reward.displayName === "$5 Reward");

        const formattedRewards = data.data.map((reward: any) => ({
            "code": `${reward.memberRewardId}`,
            "currencyCode": "USD",
            "customCreditType": 'LoyaltyRewards',
            "creditType": 'Custom',
            "initialBalance": 5,
            "currentBalance": 5,
            "isEnabled": true,
            "activationDate": `${reward.dateIssued}`,
        }));

        return formattedRewards;
    } catch (e) {
        throw new Error(`Failed to fetch coupons: ${e}`);
    }
} 