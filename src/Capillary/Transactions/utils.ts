const FLEET_REWARDS_CREDIT_CARD = "FLEET_REWARDS_CREDIT_CARD";


export function getTenderTypeCode(tenderType: string, paymentOrCardType?: string): string {

   console.log("tenderType", tenderType);
   console.log("paymentOrCardType", paymentOrCardType);

    const tenderTypeMap: { [key: string]: string } = {
        'CreditCard': paymentOrCardType === FLEET_REWARDS_CREDIT_CARD ? "PLCC" : "CREDIT CARD",
        'PLCC': "PLCC", 
        'GiftCard': "GIFT CARD",        
        'Purchase Order': "PURCHASE ORDER", 
        'Cash': "CASH",
        'Debit': "DEBIT",        
        'StoreCredit': "PROGRAM REWARD",
        'Voucher': "VOUCHER"
    };

    return tenderTypeMap[tenderType] || "CASH"; // Default to Cash (1) if type not found
}
