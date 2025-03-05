import { TokenService } from '../TokenService';
import { getActiveCoupons } from './GetCoupons';
import { redeemCoupon } from './Redeem';
import { unredeemCoupon } from './UnRedeem';

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
        return getActiveCoupons(memberEmail, this.token);
    }

    /**
     * Redeems a reward by its ID
     * @param rewardId The ID of the reward to redeem
     * @returns The response data or error
     */
    async redeemCoupon(rewardId: string) {
        return redeemCoupon(rewardId, this.token);
    }

    /**
     * Unredeems a reward by its ID
     * @param rewardId The ID of the reward to unredeem
     * @returns The response data or error
     */
    async unredeemCoupon(rewardId: string) {
        return unredeemCoupon(rewardId, this.token);
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

    

    
