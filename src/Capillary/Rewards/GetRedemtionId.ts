import { CapillaryCouponResponse, GetActiveCouponsResponse, KiboCoupon } from '../../types';

/**
 * Gets active coupons for a member from Capillary and formats them for Kibo
 * @param memberEmail The email of the member
 * @param couponCode The coupon code to get the redemption id for
 * @returns Array of coupons formatted for Kibo Commerce
 */
export async function GetRedemptionId(memberEmail: string, token: string,couponCode:string): Promise<string> {
    try {
        
        // Call to Capillary API
        const response = await fetch(`${process.env.CAPILLARY_URL}/v2/customers/coupons?email=${memberEmail}&status=ACTIVE_REDEEMED`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CAP-API-OAUTH-TOKEN': `${token}`,
                'Accept-Language': 'en',
            },
        });
        
        if (!response.ok) {
            const errorReason = await response.json();
            return "Failed to get redemption id";
        }

        // Parse Capillary API response
        const data = await response.json() as CapillaryCouponResponse;

        const redemptionInfo = data.entity.customers[0].coupons.filter(coupon => coupon.code === couponCode)[0].redemptions;

        
        
        if(redemptionInfo.length > 0){
            return redemptionInfo[0].id.toString();    
        }
        
        
        
        // If no data, customers, or coupons, return empty array
        if (!data.entity || !data.entity.customers || data.entity.customers.length === 0) {
            return "Failed to get redemption id";
        }

        // Get the first customer's coupons (assuming the email is unique)
        const customer = data.entity.customers[0];
        if (!customer.coupons || customer.coupons.length === 0) {
            return "Failed to get redemption id";
        }
        
        // Transform Capillary coupons to Kibo format
        

        // Return coupons in Kibo format
        return "formattedCoupons[0].redemptionId";
    } catch (e) {
        throw new Error(`Failed to fetch coupons: ${e}`);
    }
} 