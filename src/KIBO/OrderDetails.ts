import { kiboConfiguration } from "./Configurations";
import { Order, OrderApi, OrderCollection, Return,  } from "@kibocommerce/rest-sdk/clients/Commerce";

export const orderClient = new OrderApi(kiboConfiguration);


export const getFulFilledOrders = async (): Promise<{unSynthesized:OrderCollection,synthesized:OrderCollection}> => {

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();    
    
    const filter = `FulfillmentStatus eq Fulfilled and closedDate ge ${oneHourAgo}`;

    const data = await orderClient.getOrders({filter: filter});
    const synthesized = await orderClient.getOrders({filter: filter, mode: "synthesized"});
    
    return {unSynthesized:data,synthesized:synthesized};
}


export const getOrderDetailsById = async (orderId:string): Promise<{unSynthesized:Order,synthesized:Order} | undefined> => {
    try {
        const unSynthesized = await orderClient.getOrder({orderId:orderId});
        const synthesized = await orderClient.getOrder({orderId:orderId,mode:"synthesized"});

        return {unSynthesized,synthesized};
    } catch(e) {
        console.error("Cannot fetch order",e);
        return undefined;
    }
}