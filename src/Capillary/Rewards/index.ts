import { TokenService } from '../TokenService';

export class CouponService {
    constructor(private token: string) {
        this.token = token;
    }

    /**
     * Gets active coupons for a member
     * @param memberEmail The email of the member
     * @returns Array of coupons formatted for Kibo
     */
    async getActiveCoupons(memberEmail: string) {
        try {
            const response = await fetch(`${process.env.CAPILLARY_URL}/api/v1/loyalty/memberRewards/summary?member.email=${memberEmail}&options.UnRedeemedOnly=true&options.UnexpiredOnly=true`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`,
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

    /**
     * Redeems a reward by its ID
     * @param rewardId The ID of the reward to redeem
     * @returns The response data or error
     */
    async redeemCoupon(rewardId: string) {
        try {
            const response = await fetch(`${process.env.CAPILLARY_URL}/api/v1/loyalty/memberRewards/${rewardId}/redeem`, {
                method: 'PATCH',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`,
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

    /**
     * Unredeems a reward by its ID
     * @param rewardId The ID of the reward to unredeem
     * @returns The response data or error
     */
    async unredeemCoupon(rewardId: string) {
        try {
            const response = await fetch(`${process.env.CAPILLARY_URL}/api/v1/loyalty/memberRewards/${rewardId}/unredeem`, {
                method: 'PATCH',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`,
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
            throw new Error(`Failed to unredeem coupon: ${e}`);
        }
    }

    /**
     * Static factory method to create an instance with a valid token
     */
    public static async create(): Promise<CouponService> {
        const tokenService = TokenService.getInstance();
        const token = await tokenService.getToken();
        return new CouponService(token);
    }
}

    

    
