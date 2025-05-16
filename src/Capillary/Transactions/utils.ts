export function getTenderTypeCode(tenderType: string): string {
    const tenderTypeMap: { [key: string]: string } = {
        'CreditCard': "CREDIT CARD",
        'PLCC': "PLCC", 
        'Gift Card': "GIFT CARD",        
        'Purchase Order': "PURCHASE ORDER",
        'Cash': "CASH",
        'Debit': "DEBIT",
        'FleetRewards': "FLEET REWARDS",
        'StoreCredit': "PROGRAM REWARD",
        'Voucher': "VOUCHER"
    };

    return tenderTypeMap[tenderType] || "CASH"; // Default to Cash (1) if type not found
}
