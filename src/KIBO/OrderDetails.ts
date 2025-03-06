import { kiboConfiguration } from "./Configurations";
import { Order, OrderApi, Return,  } from "@kibocommerce/rest-sdk/clients/Commerce";

const orderClient = new OrderApi(kiboConfiguration);


export const getFulFilledOrders = async () => {

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();    
    
    const filter = `FulfillmentStatus eq Fulfilled and closedDate ge ${oneHourAgo}`;

    const data = await orderClient.getOrders({filter: filter});
    const synthesized = await orderClient.getOrders({filter: filter, mode: "synthesized"});
    
    return {data,synthesized};
}


export const getOrderDetailsById = async (orderId:string): Promise<Order | any> => {
    try {
        const data = await orderClient.getOrder({orderId:orderId});
        const synthesized = await orderClient.getOrder({orderId:orderId,mode:"synthesized"});

        return {data,synthesized};
    } catch(e) {
        console.error("Cannot fetch order",e);
        return undefined;
    }
}