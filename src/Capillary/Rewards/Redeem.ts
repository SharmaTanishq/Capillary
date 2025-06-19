import { getOrderDetailsById } from '../../KIBO/OrderDetails';
import { RedeemCouponResponse } from '../../types';

interface RedeemCouponParams {
 
    orderId:string;
    code: string;
}

/**
 * Redeems a reward by its ID
 * @param params The parameters for redeeming the coupon
 * @param token The authentication token
 * @returns The response data or error
 */
export async function redeemCoupon(params: RedeemCouponParams, token: string): Promise<RedeemCouponResponse> {
    try {
        // Format current date in US format (MM/DD/YYYY HH:mm:ss)
        const now = new Date();
        const redemptionTime = now.toISOString().slice(0, 19).replace('T', ' ');
        
        console.log("Redeem Time",params);
        const getOrderDetails = await getOrderDetailsById(params.orderId);

        if(!getOrderDetails){
            return { error: "Order not found" };
        }

        const requestBody = {
            redemptionRequestList: [
                {
                    code: params.code
                }
            ],
            user: {
                email: getOrderDetails.synthesized.email
            },
            transactionNumber: getOrderDetails.synthesized.externalId || getOrderDetails.synthesized.orderNumber,
            billAmount: getOrderDetails.synthesized.total?.toString() || "0",
            redemptionTime: redemptionTime
        };

        console.log("Request Body",requestBody);

        const response = await fetch(`${process.env.CAPILLARY_URL}/v2/coupon/redeem`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CAP-API-OAUTH-TOKEN': `${token}`,
                'Accept-Language': 'en',
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorReason = await response.json();
            console.log("Error Reason",errorReason);
            return { error: errorReason };
        }
        
        const data = await response.json();
        return { data };
    } catch (e) {
        throw new Error(`Failed to redeem coupon: ${e}`);
    }
} 