import { TokenService } from '../TokenService';

export class RewardRedeemService {
    constructor(private token: string) {
        this.token = token;
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
     * Static factory method to create an instance with a valid token
     */
    public static async create(): Promise<RewardRedeemService> {
        const tokenService = TokenService.getInstance();
        const token = await tokenService.getToken();
        return new RewardRedeemService(token);
    }
}
