import { CapillaryCouponResponse, GetActiveCouponsResponse, KiboCoupon } from '../../types';

/**
 * Gets active coupons for a member
 * @param memberEmail The email of the member
 * @param token The authentication token
 * @returns Array of coupons formatted for Kibo
 */
export async function getActiveCoupons(memberEmail: string, token: string): Promise<GetActiveCouponsResponse> {
    try {
        const response = await fetch(`${process.env.CAPILLARY_URL}/v2/customers/coupons?email=${memberEmail}&status=Active_Unredeemed`, {
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
            return { error: errorReason };
        }

        const data = await response.json() as CapillaryCouponResponse;
        
        // If no data, customers, or coupons, return empty array
        if (!data.entity || !data.entity.customers || data.entity.customers.length === 0) {
            return [];
        }

        // Get the first customer's coupons (assuming the email is unique)
        const customer = data.entity.customers[0];
        if (!customer.coupons || customer.coupons.length === 0) {
            return [];
        }
        
        // Map the coupons to the Kibo format
        const formattedCoupons: KiboCoupon[] = customer.coupons.map(coupon => ({
            "code": coupon.code,
            "currencyCode": "USD",
            "customCreditType": 'LoyaltyRewards',
            "creditType": 'Custom',
            "initialBalance": coupon.discountValue,
            "currentBalance": coupon.discountValue,
            "isEnabled": coupon.redemptionsLeft > 0,
            "activationDate": coupon.createdDate,
        }));

        return formattedCoupons;
    } catch (e) {
        throw new Error(`Failed to fetch coupons: ${e}`);
    }
} 