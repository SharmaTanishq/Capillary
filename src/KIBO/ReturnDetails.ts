import { kiboConfiguration } from "./Configurations";
import {  Return, ReturnApi, ReturnCollection,  } from "@kibocommerce/rest-sdk/clients/Commerce";

const returnClient = new ReturnApi(kiboConfiguration);

export const getReturnDetailsById = async (returnId:string): Promise<Return | undefined> => {
    try {
        const data = await returnClient.getReturn({returnId:returnId});
        return data;
    } catch(e) {
        console.error("Cannot fetch return",e);
        return undefined;
    }
}

export const getFullyRefundedReturns = async():Promise<ReturnCollection | undefined>=>{
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
   
    const filter = `refundStatus eq FullyRefunded and createdOn ge ${oneHourAgo}`;
   
    const returns = await returnClient.getReturns({filter:filter});
    return returns;
}

