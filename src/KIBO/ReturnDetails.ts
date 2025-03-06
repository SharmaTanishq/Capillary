import { kiboConfiguration } from "./Configurations";
import {  Return, ReturnApi,  } from "@kibocommerce/rest-sdk/clients/Commerce";

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

export const getFullyRefundedReturns = async()=>{
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
   
   const filterWithEmail = `refundStatus eq FullyRefunded and createDate ge ${oneHourAgo}`;
   
   const returns = await returnClient.getReturns({filter:filterWithEmail});
   return returns;
}

