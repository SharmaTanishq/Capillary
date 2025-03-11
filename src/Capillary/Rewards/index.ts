import { TokenService } from '../TokenService';
import { getActiveCoupons } from './GetCoupons';
import { redeemCoupon } from './Redeem';
import { unredeemCoupon } from './UnRedeem';

interface RedeemParams {
    code: string;
    email: string;
    billAmount?: string;
}

interface UnredeemParams {
    redemptionId: string;
}

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
     * Redeems a reward by its code
     * @param params The parameters for redeeming the coupon
     * @returns The response data or error
     */
    async redeemCoupon(params: RedeemParams) {
        return redeemCoupon(params, this.token);
    }

    /**
     * Unredeems a reward by its redemption ID
     * @param params The parameters for unredeeeming the coupon
     * @returns The response data or error
     */
    async unredeemCoupon(params: UnredeemParams) {
        return unredeemCoupon(params, this.token);
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

    

    
